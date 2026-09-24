import { SignJWT, 
  jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DeviceInfo } from "@/lib/device";

export const COOKIE_NAME = "rennovex_session";

function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value 
    && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is required in production");
  return new TextEncoder().encode(value 
    ?? "development-only-secret-change-me");
}

function secureCookie() {
  return (process.env.APP_URL 
    ?? process.env.NEXT_PUBLIC_SITE_URL 
    ?? "").startsWith("https://");
}

export type SessionPayload = {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  role: Role;
};

export async function createSession(
  payload: Omit<SessionPayload, "sessionId">,
  rememberMe: boolean,
  device: DeviceInfo,
  ipAddress?: string | null,
) {
  const lifetimeSeconds = rememberMe 
    ? 60 * 60 * 24 * 7 
    : 60 * 60 * 2;
  const expiresAt = new Date(Date.now() + lifetimeSeconds * 1000);
  const record = await prisma.authSession.create({
    data: {
      userId: payload.userId, 
      deviceName: device.deviceName, 
      deviceType: device.deviceType,
      browser: device.browser, 
      os: device.os, 
      userAgent: device.userAgent, 
      ipAddress: ipAddress 
        || null,
      rememberMe, 
      expiresAt,
    },
  });
  const token = await new SignJWT({ ...payload, 
    sessionId: record.id })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiresAt).sign(getSecret());
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true, 
    secure: secureCookie(), 
    sameSite: "lax", 
    path: "/", 
    priority: "high",
    ...(rememberMe 
      ? { maxAge: lifetimeSeconds } 
      : {}),
  });
  return record;
}

export async function decodeSessionToken(): Promise<SessionPayload | null> {
  try {
    const token = (await cookies()).get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, 
      getSecret());
    return payload as SessionPayload;
  } catch { return null; }
}

export async function getSession(): Promise<SessionPayload | null> {
  const payload = await decodeSessionToken();
  if (!payload?.sessionId) return null;
  const record = await prisma.authSession.findUnique({
    where: { id: payload.sessionId },
    select: { revokedAt: true, 
      expiresAt: true, 
      lastActiveAt: true, 
      user: { select: { isActive: true, 
      role: true, 
      name: true, 
      email: true } } },
  });
  const now = new Date();
  if (!record 
    || record.revokedAt 
    || record.expiresAt <= now 
    || !record.user.isActive) return null;
  if (now.getTime() - record.lastActiveAt.getTime() > 5 * 60 * 1000) {
    void prisma.authSession.update({ where: { id: payload.sessionId }, 
      data: { lastActiveAt: now } }).catch(() => undefined);
  }
  return { ...payload, 
    role: record.user.role, 
    name: record.user.name, 
    email: record.user.email };
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin/login?reason=expired");
  return session;
}

export async function requireRole(roles: Role[]) {
  const session = await requireSession();
  if (!roles.includes(session.role)) redirect("/admin?error=forbidden");
  return { ...session, 
    id: session.userId, 
    isActive: true };
}

export function canManageUsers(role: Role) { return role === "SUPER_ADMIN"; }
export function canManageSettings(role: Role) { return role === "SUPER_ADMIN" 
  || role === "ADMIN"; }
export function canDeleteContent(role: Role) { return role === "SUPER_ADMIN" 
  || role === "ADMIN"; }

export async function destroySession() {
  const session = await decodeSessionToken();
  if (session?.sessionId) await prisma.authSession.updateMany({ where: { id: session.sessionId }, 
    data: { revokedAt: new Date() } });
  (await cookies()).delete(COOKIE_NAME);
}
