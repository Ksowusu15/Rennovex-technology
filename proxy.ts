import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getAuthSecret() {
  const value = process.env.AUTH_SECRET;

  if (!value && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is required in production");
  }

  return new TextEncoder().encode(value ?? "development-only-secret-change-me");
}
const publicAdmin = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || publicAdmin.some((path) => pathname.startsWith(path))) return NextResponse.next();

  const token = request.cookies.get("rennovex_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login?reason=required", request.url));

  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    if (pathname.startsWith("/admin/users") || pathname.startsWith("/admin/activity")) {
      if (payload.role !== "SUPER_ADMIN") return NextResponse.redirect(new URL("/admin?error=forbidden", request.url));
    }
    if ((pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/messages")) && !["SUPER_ADMIN", "ADMIN"].includes(String(payload.role))) {
      return NextResponse.redirect(new URL("/admin?error=forbidden", request.url));
    }
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/admin/login?reason=expired", request.url));
    response.cookies.delete("rennovex_session");
    return response;
  }
}

export const config = { matcher: ["/admin/:path*"] };
