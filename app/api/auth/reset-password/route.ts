import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[a-z]/, "Include a lowercase letter.")
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/[0-9]/, "Include a number."),
});

export async function POST(request: Request) {
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

    const passwordHash = await bcrypt.hash(password, 
      12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: passwordHash,
          resetTokenHash: null,
          resetTokenExpires: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
      prisma.authSession.updateMany({
        where: { userId: user.id, 
          revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "PASSWORD_RESET",
          entity: "User",
          entityId: user.id,
          details: "Administrator reset their password; all active sessions were revoked.",
        },
      }),
    ]);

    const response = NextResponse.json({ ok: true });
    response.cookies.delete("rennovex_session");
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message 
          || "Enter a valid password." },
        { status: 400 },
      );
    }

    console.error("Password reset failed:", 
      error);
    return NextResponse.json(
      { error: "Unable to reset the password right now. Please request a new link." },
      { status: 500 },
    );
  }
}
