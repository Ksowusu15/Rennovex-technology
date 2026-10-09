import { getAuthSecret } from "@/lib/auth-secret";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const publicAdmin = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (
    !pathname.startsWith("/admin") ||
    publicAdmin.some((path) => pathname.startsWith(path))
  )
    return NextResponse.next();

  const token = request.cookies.get("rennovex_session")?.value;
  if (!token)
    return NextResponse.redirect(
      new URL("/admin/login?reason=required", request.url),
    );

  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.sessionId !== "string" ||
      typeof payload.userId !== "string"
    ) {
      throw new Error("Invalid administrator session.");
    }
    if (
      pathname.startsWith("/admin/users") ||
      pathname.startsWith("/admin/activity")
    ) {
      if (payload.role !== "SUPER_ADMIN")
        return NextResponse.redirect(new URL("/admin?error=forbidden", request.url));
    }
    if (
      (pathname.startsWith("/admin/settings") ||
        pathname.startsWith("/admin/messages")) &&
      !["SUPER_ADMIN", "ADMIN"].includes(String(payload.role))
    ) {
      return NextResponse.redirect(new URL("/admin?error=forbidden", request.url));
    }
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(
      new URL("/admin/login?reason=expired", request.url),
    );
    response.cookies.delete("rennovex_session");
    return response;
  }
}

export const config = { matcher: ["/admin/:path*"] };
