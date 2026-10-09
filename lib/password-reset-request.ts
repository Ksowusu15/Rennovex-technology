import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPublicAppUrl } from "@/lib/app-url";
import { emailSender, sendTransactionalEmail } from "@/lib/email";

const genericMessage =
  "If an active account exists, we will email a password reset link.";
const schema = z.object({ email: z.string().trim().email().max(150) });

export async function requestPasswordReset(
  request: Request,
  kind: "admin" | "client",
) {
  try {
    const input = schema.parse(await request.json());
    const where = { email: input.email.toLowerCase() };
    const select = { id: true, email: true, name: true, isActive: true };
    const account =
      kind === "admin"
        ? await prisma.user.findUnique({ where, select })
        : await prisma.client.findUnique({ where, select });
    if (!account?.isActive) return NextResponse.json({ message: genericMessage });

    const token = randomBytes(32).toString("hex");
    const data = {
      resetTokenHash: createHash("sha256").update(token).digest("hex"),
      resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
    };
    if (kind === "admin")
      await prisma.user.update({ where: { id: account.id }, data });
    else await prisma.client.update({ where: { id: account.id }, data });

    const path = kind === "admin" ? "admin" : "client-portal";
    const resetUrl = `${getPublicAppUrl(request)}/${path}/reset-password?token=${token}`;
    const from = emailSender(kind);
    if (process.env.RESEND_API_KEY && from) {
      try {
        await sendTransactionalEmail({
          from,
          to: account.email,
          subject: `Reset your Rennovex ${kind} password`,
          text: [
            `Hello ${account.name},`,
            "",
            "Use this link to reset your password:",
            resetUrl,
            "",
            "The link expires in 10 minutes and can be used once.",
            "If you did not request this, ignore this email.",
          ].join("\n"),
        });
      } catch {
        // Keep the public reply identical for existing and unknown accounts.
        console.error(`Rennovex ${kind} reset email delivery failed.`);
      }
    } else if (process.env.NODE_ENV !== "production") {
      console.log(`[Development only: ${kind} password reset] ${resetUrl}`);
    } else {
      console.error(`Rennovex ${kind} reset email is not configured.`);
    }
    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { message: "Enter a valid email address." },
        { status: 400 },
      );
    }
    console.error("Password recovery service unavailable.");
    return NextResponse.json(
      { message: "Please try again later." },
      { status: 503 },
    );
  }
}
