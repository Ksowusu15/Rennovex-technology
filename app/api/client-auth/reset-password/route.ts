import { newPasswordSchema } from "@/lib/password-policy";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import { rejectCrossOrigin } from "@/lib/request-origin";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i),
  password: newPasswordSchema,
});

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;
  const throttle = rateLimit(request, "client-reset", 5, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);

  try {
    const input = schema.parse(await request.json());
    const tokenHash = createHash("sha256").update(input.token).digest("hex");

    const client = await prisma.client.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpires: {
          gt: new Date(),
        },
        isActive: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        {
          error: "This reset link is invalid, expired, or has already been used.",
        },
        { status: 400 },
      );
    }

    const password = await bcrypt.hash(input.password, 12);

    const updated = await prisma.client.updateMany({
      where: {
        id: client.id,
        resetTokenHash: tokenHash,
        resetTokenExpires: { gt: new Date() },
        isActive: true,
      },
      data: { password, resetTokenHash: null, resetTokenExpires: null },
    });
    if (updated.count !== 1) {
      return NextResponse.json(
        { error: "This reset link has already been used or expired." },
        { status: 400 },
      );
    }

    const response = NextResponse.json({
      ok: true,
    });
    response.cookies.delete("rennovex_client_session");

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message ?? "Enter a valid password.",
        },
        { status: 400 },
      );
    }

    console.error("Client password reset failed:", error);

    return NextResponse.json(
      {
        error: "Unable to reset the password right now. Please request a new link.",
      },
      { status: 500 },
    );
  }
}
