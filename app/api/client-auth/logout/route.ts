import { rejectCrossOrigin } from "@/lib/request-origin";
import { NextResponse } from "next/server";
import { clearClientSession } from "@/lib/client-auth";

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  await clearClientSession();
  return NextResponse.redirect(new URL("/client-portal", request.url), 303);
}
