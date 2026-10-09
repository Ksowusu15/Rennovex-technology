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
  const throttle = rateLimit(request, "admin-reset", 5, 900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);

  try {
    const { token, password } = schema.parse(await request.json());
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpires: { gt: new Date() },
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "This reset link is invalid, expired, or has already been used." },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      const changed = await tx.user.updateMany({
        where: {
          id: user.id,
          resetTokenHash: tokenHash,
          resetTokenExpires: { gt: new Date() },
          isActive: true,
        },
        data: {
          password: passwordHash,
          resetTokenHash: null,
          resetTokenExpires: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      });
      if (changed.count !== 1) throw new Error("RESET_ALREADY_USED");
      await tx.authSession.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET",
          entity: "User",
          entityId: user.id,
          details: "Password reset; all active administrator sessions revoked.",
        },
      });
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.delete("rennovex_session");
    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "RESET_ALREADY_USED") {
      return NextResponse.json(
        { error: "This reset link has already been used or expired." },
        { status: 400 },
      );
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Enter a valid password." },
        { status: 400 },
      );
    }

    console.error("Password reset failed:", error);
    return NextResponse.json(
      {
        error: "Unable to reset the password right now. Please request a new link.",
      },
      { status: 500 },
    );
  }
}
