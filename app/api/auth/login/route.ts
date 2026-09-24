import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import { getRequestIp } from "@/lib/audit";
import { rateLimit, 
  tooManyRequests } from "@/lib/rate-limit";
import { parseDevice } from "@/lib/device";

const schema = z.object({ email: z.string().email(), 
  password: z.string().min(8), 
  rememberMe: z.boolean().optional().default(false) });
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const LIMITS = { SUPER_ADMIN: 5, 
  ADMIN: 3, 
  EDITOR: 2 } as const;

async function recordLogin(data: { userId?: string; email: string; success: boolean; reason?: string; ip: string | null; userAgent: string }) {
  const device = parseDevice(data.userAgent);
  await prisma.loginHistory.create({ data: { userId: data.userId, 
    email: data.email, 
    success: data.success, 
    reason: data.reason, 
    ipAddress: data.ip, 
    ...device } });
}

async function sendNewDeviceAlert(to: string, 
  name: string, 
  device: ReturnType<typeof parseDevice>, 
  ip: string | null) {
  if (!process.env.RESEND_API_KEY 
    || !process.env.ADMIN_FROM_EMAIL) return;
  await fetch("https://api.resend.com/emails", 
    { method: "POST", 
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 
    "Content-Type": "application/json" }, 
    body: JSON.stringify({ from: process.env.ADMIN_FROM_EMAIL, 
    to, 
    subject: "New Rennovex admin login", 
    html: `<p>Hello ${name},</p><p>A new login was detected on <strong>${device.deviceName}</strong>${ip 
      ? ` from ${ip}` 
      : ""}.</p><p>If this was not you, reset your password and end the session from My Profile → Active Sessions.</p>` }) }).catch(() => undefined);
}

export async function POST(request: Request) {
  const throttle = rateLimit(request, 
    "auth-login", 
    10, 
    900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  const ip = await getRequestIp();
  const userAgent = request.headers.get("user-agent") 
    ?? "";
  try {
    const { email, password, rememberMe } = schema.parse(await request.json());
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const now = new Date();
    if (user?.lockedUntil 
      && user.lockedUntil > now) {
      await recordLogin({ userId: user.id, 
        email: normalizedEmail, 
        success: false, 
        reason: "Account temporarily locked", 
        ip, 
        userAgent });
      const minutes = Math.max(1, 
        Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 60000));
      return NextResponse.json({ error: `Too many unsuccessful attempts. Try again in ${minutes} minute${minutes === 1 
        ? "" 
        : "s"}.` }, 
        { status: 423 });
    }
    const valid = user 
      && user.isActive && await bcrypt.compare(password, 
      user.password);
    if (!valid) {
      if (user) {
        const attempts = user.failedLoginAttempts + 1;
        await prisma.user.update({ where: { id: user.id }, 
          data: { failedLoginAttempts: attempts >= MAX_ATTEMPTS 
            ? 0 
            : attempts, 
          lockedUntil: attempts >= MAX_ATTEMPTS 
            ? new Date(Date.now() + LOCK_MINUTES * 60000) 
            : null } });
      }
      await recordLogin({ userId: user?.id, 
        email: normalizedEmail, 
        success: false, 
        reason: "Invalid credentials or inactive account", 
        ip, 
        userAgent });
      return NextResponse.json({ error: "Invalid email or password" }, 
        { status: 401 });
    }
    const device = parseDevice(userAgent);
    const knownDevice = await prisma.authSession.findFirst({
      where: {
        userId: user.id,
        browser: device.browser,
        os: device.os,
        deviceType: device.deviceType,
        userAgent,
      },
      select: { id: true },
    });
    await prisma.authSession.updateMany({ where: { userId: user.id, 
      OR: [{ expiresAt: { lte: now } }, 
      { revokedAt: { not: null } }] }, 
      data: { revokedAt: now } });
    const active = await prisma.authSession.findMany({ where: { userId: user.id, 
      revokedAt: null, 
      expiresAt: { gt: now } }, 
      orderBy: { lastActiveAt: "asc" }, 
      select: { id: true } });
    const max = LIMITS[user.role];
    if (active.length >= max) {
      const revokeIds = active.slice(0, 
        active.length - max + 1).map((item) => item.id);
      await prisma.authSession.updateMany({ where: { id: { in: revokeIds } }, 
        data: { revokedAt: now } });
    }
    await prisma.user.update({ where: { id: user.id }, 
      data: { failedLoginAttempts: 0, 
      lockedUntil: null, 
      lastLoginAt: now, 
      lastLoginIp: ip } });
    const session = await createSession({ userId: user.id, 
      email: user.email, 
      name: user.name, 
      role: user.role }, 
      rememberMe, 
      device, 
      ip);
    await prisma.auditLog.create({ data: { action: "LOGIN", 
      entity: "AUTH", 
      entityId: session.id, 
      userId: user.id, 
      ipAddress: ip, 
      details: `${rememberMe 
        ? "Remembered" 
        : "Standard"} session · ${device.deviceName}` } });
    await recordLogin({ userId: user.id, 
      email: user.email, 
      success: true, 
      reason: "Successful login", 
      ip, 
      userAgent });
    if (!knownDevice 
      && user.emailNewDeviceAlerts) {
      await sendNewDeviceAlert(user.email, 
        user.name, 
        device, 
        ip);
    }
    return NextResponse.json({ ok: true, 
      role: user.role, 
      redirectTo: "/admin" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid request" }, 
      { status: 400 });
  }
}
