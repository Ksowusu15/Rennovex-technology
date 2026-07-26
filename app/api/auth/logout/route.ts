import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  await destroySession();

  const response = NextResponse.json(
    { success: true, redirectTo: "/admin/login?reason=signed-out" },
    { status: 200 },
  );

  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return response;
}
