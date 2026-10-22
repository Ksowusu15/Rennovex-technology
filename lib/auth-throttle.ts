import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSecret } from "@/lib/auth-secret";
import { getClientIp, tooManyRequests } from "@/lib/rate-limit";

/** Atomic PostgreSQL buckets are shared across instances and cold starts. */
async function consume(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowMs);
  const rows = await prisma.$queryRaw<{ count: number; expiresAt: Date }[]>`
    INSERT INTO "AuthRateLimit" ("key", "count", "expiresAt")
    VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "AuthRateLimit"."expiresAt" <= ${now}
        THEN 1 ELSE LEAST("AuthRateLimit"."count" + 1, ${limit + 1}) END,
      "expiresAt" = CASE WHEN "AuthRateLimit"."expiresAt" <= ${now}
        THEN ${expiresAt} ELSE "AuthRateLimit"."expiresAt" END
    RETURNING "count", "expiresAt"
  `;
  const bucket = rows[0];
  return bucket.count > limit
    ? tooManyRequests(
        Math.max(
          1,
          Math.ceil((bucket.expiresAt.getTime() - now.getTime()) / 1000),
        ),
      )
    : null;
}

export async function authThrottle(
  request: Request,
  account: string,
  namespace = "login",
) {
  const key = (kind: string, value: string) =>
    createHmac("sha256", getAuthSecret())
      .update(`${namespace}:${kind}:${value}`)
      .digest("hex");
  try {
    const ip = await consume(
      key("ip", getClientIp(request)),
      20,
      15 * 60 * 1000,
    );
    if (ip) return ip;
    return await consume(
      key("account", account.trim().toLowerCase()),
      10,
      15 * 60 * 1000,
    );
  } catch {
    console.error("Shared authentication throttle unavailable.");
    return NextResponse.json(
      {
        error: "Sign-in is temporarily unavailable. Please try again shortly.",
      },
      { status: 503 },
    );
  }
}
