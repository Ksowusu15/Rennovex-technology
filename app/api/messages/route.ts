import { notifyTeam } from "@/lib/team-notifications";
import { rejectCrossOrigin } from "@/lib/request-origin";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(150),
  phone: z.string().max(30).optional().or(z.literal("")),
  projectType: z.string().max(80).optional().or(z.literal("")),
  message: z.string().min(10).max(5000),
});

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const throttle = rateLimit(request, "contact", 6, 600000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  try {
    const data = schema.parse(await request.json());
    const message = await prisma.message.create({ data });
    after(() => notifyTeam({
      subject: `New Rennovex enquiry from ${data.name}`,
      replyTo: data.email,
      dashboardPath: "/admin/messages",
      fields: [
        ["Name", data.name],
        ["Email", data.email],
        ["Phone", data.phone],
        ["Project type", data.projectType],
        ["Message", data.message],
      ],
    }));
    return NextResponse.json({ id: message.id }, { status: 201 });
  } catch (error) {
    if (!(error instanceof z.ZodError) && !(error instanceof SyntaxError)) {
      console.error("Form service unavailable:", error);
      return NextResponse.json(
        {
          error: "This service is temporarily unavailable. Please try again later.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
}
