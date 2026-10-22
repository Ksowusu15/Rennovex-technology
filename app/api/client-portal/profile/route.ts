import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientSession, createClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { rejectCrossOrigin } from "@/lib/request-origin";
import { newPasswordSchema } from "@/lib/password-policy";
import { authThrottle } from "@/lib/auth-throttle";

const schema = z.object({
  phone: z.string().trim().max(30),
  company: z.string().trim().max(150),
  currentPassword: z.string().max(128),
  newPassword: z.union([z.literal(""), newPasswordSchema]),
});

export async function PATCH(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  try {
    const session = await getClientSession();
    if (!session) {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 },
      );
    }
    const input = schema.parse(await request.json());
    if (input.newPassword) {
      const blockedPassword = await authThrottle(
        request,
        session.id,
        "client-password",
      );
      if (blockedPassword) return blockedPassword;
    }
    const client = await prisma.client.findUnique({
      where: { id: session.id },
    });
    if (!client?.isActive || !client.password) {
      return NextResponse.json(
        { error: "Please sign in again." },
        { status: 401 },
      );
    }
    if (
      input.newPassword &&
      !(await bcrypt.compare(input.currentPassword, client.password))
    ) {
      return NextResponse.json(
        { error: "Your current password is incorrect." },
        { status: 400 },
      );
    }
    const password = input.newPassword
      ? await bcrypt.hash(input.newPassword, 12)
      : undefined;
    const updated = await prisma.client.updateMany({
      where: { id: client.id, password: client.password, isActive: true },
      data: {
        phone: input.phone || null,
        company: input.company || null,
        ...(password
          ? {
              password,
              resetTokenHash: null,
              resetTokenExpires: null,
            }
          : {}),
      },
    });
    if (updated.count !== 1) {
      return NextResponse.json(
        { error: "Your account changed. Please sign in again." },
        { status: 409 },
      );
    }
    if (password) await createClientSession({ ...client, password });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error:
            error instanceof z.ZodError
              ? error.issues[0]?.message
              : "Invalid request.",
        },
        { status: 400 },
      );
    }
    console.error("Client profile update failed.");
    return NextResponse.json(
      { error: "Unable to save changes right now." },
      { status: 503 },
    );
  }
}
