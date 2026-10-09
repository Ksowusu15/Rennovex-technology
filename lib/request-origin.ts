import { NextResponse } from "next/server";

export function rejectCrossOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") {
    return NextResponse.json(
      { error: "Request origin is not allowed." },
      { status: 403 },
    );
  }
  // Browsers set this forbidden header themselves. It describes the actual
  // page-to-request relationship even when a proxy rewrites the server URL.
  // Non-browser clients can already call these APIs without an Origin header.
  if (site === "same-origin") return null;

  const origin = request.headers.get("origin");
  if (!origin) return null; // Permit non-browser clients; auth still applies.
  const requestUrl = new URL(request.url);
  const allowed = new Set([requestUrl.origin]);
  // HTTP LAN browsers may omit Fetch Metadata. Match the actual request Host
  // using the request protocol, rather than trusting forwarded host headers.
  const host = request.headers.get("host");
  if (host) {
    try {
      const hostUrl = new URL(`${requestUrl.protocol}//${host}`);
      if (hostUrl.host === host && !hostUrl.username && !hostUrl.password) {
        allowed.add(hostUrl.origin);
      }
    } catch {
      // Malformed Host values do not expand the allowed origins.
    }
  }
  for (const value of [process.env.APP_URL, process.env.NEXT_PUBLIC_SITE_URL]) {
    if (value) {
      try {
        allowed.add(new URL(value).origin);
      } catch {
        /* Config check reports it. */
      }
    }
  }
  if (!allowed.has(origin)) {
    return NextResponse.json(
      { error: "Request origin is not allowed." },
      { status: 403 },
    );
  }
  return null;
}
