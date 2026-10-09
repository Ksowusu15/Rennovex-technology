import { notifyTeam } from "@/lib/team-notifications";
import { rejectCrossOrigin } from "@/lib/request-origin";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { makeReference } from "@/lib/references";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email().max(150),
  phone: z.string().max(30).optional(),
  company: z.string().max(150).optional(),
  service: z.string().max(100).optional(),
  preferredDate: z.string().min(1),
  notes: z.string().max(2000).optional(),
});

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const throttle = rateLimit(request, "bookings", 5, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);

  try {
    const data = schema.parse(await request.json());
    const date = new Date(data.preferredDate);
    if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Choose a valid future date." },
        { status: 400 },
      );
    }
    const item = await prisma.consultationBooking.create({
      data: {
        ...data,
        preferredDate: date,
        reference: makeReference("RNX-B"),
      },
    });
    after(() => notifyTeam({
      subject: `New consultation booking - ${item.reference}`,
      replyTo: data.email,
      dashboardPath: "/admin/bookings",
      fields: [
        ["Reference", item.reference],
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Company", data.company],
        ["Service", data.service],
        ["Preferred date (UTC)", date.toISOString()],
        ["Notes", data.notes],
      ],
    }));

    return NextResponse.json(
      { ok: true, reference: item.reference },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Complete the required fields and choose a future date." },
        { status: 400 },
      );
    }
    console.error("Booking service unavailable:", error);
    return NextResponse.json(
      { error: "Booking is temporarily unavailable. Please try again later." },
      { status: 503 },
    );
  }
}
