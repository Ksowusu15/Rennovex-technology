import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/request-origin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClientSession } from "@/lib/client-auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const throttle = rateLimit(request, "client-login", 10, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);

  try {
    const input = schema.parse(await request.json());
    const email = input.email.toLowerCase().trim();
    const client = await prisma.client.findUnique({
      where: { email },
    });

    if (
      !client ||
      !client.isActive ||
      !client.password ||
      !(await bcrypt.compare(input.password, client.password))
    ) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    await prisma.client.update({
      where: { id: client.id },
      data: { lastLoginAt: new Date() },
    });

    await createClientSession(client);

    return NextResponse.json({
      ok: true,
      redirectTo: "/client-portal/dashboard",
    });
  } catch {
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 },
    );
  }
}
