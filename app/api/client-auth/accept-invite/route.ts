import { z } from "zod";
import { newPasswordSchema } from "@/lib/password-policy";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/request-origin";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashClientToken } from "@/lib/client-invitations";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const throttle = rateLimit(request, "client-invite", 5, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);

  try {
    const body = await request.json();
    const { token, password } = z
      .object({
        token: z.string().regex(/^[a-f0-9]{64}$/i),
        password: newPasswordSchema,
      })
      .parse(body);

    if (!token || password.length < 8) {
      return NextResponse.json(
        {
          error: "Use a password with at least 8 characters.",
        },
        {
          status: 400,
        },
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        inviteTokenHash: hashClientToken(token),
        inviteTokenExpires: {
          gt: new Date(),
        },
        isActive: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          error: "This invitation is invalid or has expired.",
        },
        {
          status: 400,
        },
      );
    }

    const updated = await prisma.client.updateMany({
      where: {
        id: client.id,
        inviteTokenHash: hashClientToken(token),
        inviteTokenExpires: { gt: new Date() },
        isActive: true,
      },
      data: {
        password: await bcrypt.hash(password, 12),
        inviteTokenHash: null,
        inviteTokenExpires: null,
      },
    });

    if (updated.count !== 1) {
      return NextResponse.json(
        { error: "This invitation has already been used or expired." },
        { status: 400 },
      );
    }
    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        error: "Unable to activate your account right now.",
      },
      {
        status: 500,
      },
    );
  }
}
