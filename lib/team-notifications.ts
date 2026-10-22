import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { emailSender, sendTransactionalEmail } from "@/lib/email";
import { COMPANY_EMAIL } from "@/lib/company-contact";
import { prisma } from "@/lib/prisma";

type TeamNotification = {
  subject: string;
  replyTo: string;
  fields: readonly (readonly [string, string | null | undefined])[];
  dashboardPath: string;
};

const payloadSchema = z.object({
  to: z.string(),
  reply_to: z.string(),
  subject: z.string(),
  text: z.string(),
});

/** Save the request and its notification in the same database transaction. */
export async function queueTeamNotification(
  input: TeamNotification,
  tx: Prisma.TransactionClient,
) {
  const siteUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const dashboardUrl = siteUrl
    ? new URL(input.dashboardPath, siteUrl).toString()
    : null;
  const job = await tx.notificationJob.create({
    data: {
      payload: {
        to: process.env.CONTACT_NOTIFICATION_EMAIL || COMPANY_EMAIL,
        reply_to: input.replyTo,
        subject: input.subject.replace(/[\r\n]/g, " "),
        text: [
          "A new request has been saved in your Rennovex dashboard.",
          "",
          ...input.fields.map(
            ([label, value]) => `${label}: ${value || "Not provided"}`,
          ),
          "",
          dashboardUrl
            ? `Review request: ${dashboardUrl}`
            : "Sign in to the admin dashboard to review the request.",
        ].join("\n"),
      },
    },
  });
  return job.id;
}

/** Lease jobs so concurrent workers do not send the same notification. */
export async function deliverNotification(id: string) {
  const now = new Date();
  const claimed = await prisma.notificationJob.updateMany({
    where: {
      id,
      status: "PENDING",
      attempts: { lt: 6 },
      nextAttemptAt: { lte: now },
      OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
    },
    data: {
      lockedUntil: new Date(now.getTime() + 60000),
      attempts: { increment: 1 },
    },
  });
  if (claimed.count !== 1) return;
  const job = await prisma.notificationJob.findUniqueOrThrow({ where: { id } });
  try {
    const from = emailSender("contact");
    if (!from) throw new Error("Notification sender is not configured.");
    await sendTransactionalEmail(
      {
        ...payloadSchema.parse(job.payload),
        from,
      },
      `notification/${job.id}`,
    );
    await prisma.notificationJob.update({
      where: { id },
      data: {
        status: "SENT",
        deliveredAt: new Date(),
        lockedUntil: null,
        lastError: null,
      },
    });
  } catch (error) {
    await prisma.notificationJob.update({
      where: { id },
      data: {
        status: job.attempts >= 6 ? "FAILED" : "PENDING",
        lockedUntil: null,
        nextAttemptAt: new Date(
          Date.now() + Math.min(60, 2 ** job.attempts) * 60000,
        ),
        lastError:
          error instanceof Error && /configured|required/.test(error.message)
            ? "Email delivery is not configured."
            : "Provider delivery failed; retry pending.",
      },
    });
    console.error("Notification delivery failed; job retained for retry.");
  }
}

export async function retryPendingNotifications(limit = 4) {
  const now = new Date();
  await prisma.notificationJob.updateMany({
    where: {
      status: "PENDING",
      attempts: { gte: 6 },
      OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
    },
    data: {
      status: "FAILED",
      lockedUntil: null,
      lastError: "Retry limit reached. Review and retry manually.",
    },
  });
  const jobs = await prisma.notificationJob.findMany({
    where: {
      status: "PENDING",
      attempts: { lt: 6 },
      nextAttemptAt: { lte: now },
      OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
    },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });
  for (const job of jobs) await deliverNotification(job.id);
  await prisma.authRateLimit.deleteMany({ where: { expiresAt: { lt: now } } });
  return jobs.length;
}
