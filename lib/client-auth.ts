import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { prisma } from "@/lib/prisma";
import { getAuthSecret } from "@/lib/auth-secret";

const COOKIE_NAME = "rennovex_client_session";

function sessionVersion(passwordHash: string) {
  return createHmac("sha256", getAuthSecret()).update(passwordHash).digest("hex");
}

export async function createClientSession(client: {
  id: string;
  email: string;
  name: string;
  password: string | null;
}) {
  if (!client.password) throw new Error("Client account has no password.");
  const token = await new SignJWT({
    clientId: client.id,
    type: "client",
    version: sessionVersion(client.password),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getAuthSecret());

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

// React cache shares account checks only within the current server render.
export const getClientSession = cache(async function getClientSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  let payload;
  try {
    ({ payload } = await jwtVerify(token, getAuthSecret(), {
      algorithms: ["HS256"],
    }));
  } catch {
    return null;
  }
  if (
    payload.type !== "client" ||
    typeof payload.clientId !== "string" ||
    typeof payload.version !== "string" ||
    !/^[a-f0-9]{64}$/.test(payload.version)
  )
    return null;

  // Check live account state, including password changes on other devices.
  const client = await prisma.client.findUnique({
    where: { id: payload.clientId },
    select: { id: true, email: true, name: true, password: true, isActive: true },
  });
  if (!client?.isActive || !client.password) return null;
  const actual = Buffer.from(payload.version, "hex");
  const expected = Buffer.from(sessionVersion(client.password), "hex");
  if (!timingSafeEqual(actual, expected)) return null;
  return { id: client.id, email: client.email, name: client.name };
});

export async function clearClientSession() {
  (await cookies()).delete(COOKIE_NAME);
}
