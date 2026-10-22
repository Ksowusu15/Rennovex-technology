import {
  queueTeamNotification,
  deliverNotification,
} from "@/lib/team-notifications";
import { rejectCrossOrigin } from "@/lib/request-origin";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeReference } from "@/lib/references";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  service: z.string().min(2),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  requirements: z.string().min(10).max(3000),
});
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const throttle = rateLimit(request, "quotes", 5, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  try {
    const data = schema.parse(await request.json());
    const { item, jobId } = await prisma.$transaction(async (tx) => {
      const item = await tx.quoteRequest.create({
        data: { ...data, reference: makeReference("RNX-Q") },
      });
      const jobId = await queueTeamNotification(
        {
          subject: `New quote request — ${item.reference}`,
          replyTo: data.email,
          dashboardPath: "/admin/quotes",
          fields: [
            ["Reference", item.reference],
            ["Name", data.name],
            ["Email", data.email],
            ["Phone", data.phone],
            ["Company", data.company],
            ["Service", data.service],
            ["Budget", data.budget],
            ["Timeline", data.timeline],
            ["Requirements", data.requirements],
          ],
        },
        tx,
      );
      return { item, jobId };
    });
    after(() => deliverNotification(jobId));

    return NextResponse.json(
      { ok: true, reference: item.reference },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Please review the quote details and try again." },
      { status: 400 },
    );
  }
}
