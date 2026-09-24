import type { NextRequest } from "next/server";

function cleanUrl(value: string) {
  return value.trim().replace(/\/+$/, 
    "");
}

export function getPublicAppUrl(request?: Request | NextRequest) {
  const configured =
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL;

  if (configured) return cleanUrl(configured);

  if (request) {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost 
      || request.headers.get("host");

    if (host) {
      const protocol = forwardedProto 
        || (host.includes("localhost") 
        || host.startsWith("127.") 
        || host.startsWith("192.168.") 
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
