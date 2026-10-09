import type { NextRequest } from "next/server";

function cleanUrl(value: string) {
  return value.trim().replace(/\/+$/, "");
}

export function getPublicAppUrl(request?: Request | NextRequest) {
  const configured =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL;

  if (configured) {
    const url = new URL(configured);
    const localProductionTest =
      !process.env.VERCEL &&
      !process.env.VERCEL_ENV &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);

    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      throw new Error("APP_URL must be an HTTP or HTTPS origin without credentials.");
    }
    if (
      process.env.NODE_ENV === "production" &&
      url.protocol !== "https:" &&
      !localProductionTest
    ) {
      throw new Error("APP_URL must use HTTPS in production.");
    }
    return cleanUrl(url.origin);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("APP_URL or NEXT_PUBLIC_SITE_URL is required in production.");
  }

  if (request) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");

    if (host) {
      const protocol =
        forwardedProto ||
        (host.includes("localhost") ||
        host.startsWith("127.") ||
        host.startsWith("192.168.")
          ? "http"
          : "https");
      return `${protocol}://${host}`;
    }

    try {
      return cleanUrl(new URL(request.url).origin);
    } catch {
      // Fall through to the local development default.
    }
  }

  return "http://localhost:3000";
}
