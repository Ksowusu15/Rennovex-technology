import { rejectCrossOrigin } from "@/lib/request-origin";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
const schema = z.object({ email: z.string().email(), name: z.string().optional() });
export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const throttle = rateLimit(request, "newsletter", 5, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  try {
    const data = schema.parse(await request.json());
    await prisma.newsletterSubscriber.upsert({
      where: { email: data.email },
      update: { name: data.name || undefined, isSubscribed: true },
      create: data,
    });
    return NextResponse.json({ ok: true });
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
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
}
