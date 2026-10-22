import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { retryPendingNotifications } from "@/lib/team-notifications";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization") || "";
  const expected = `Bearer ${secret}`;
  if (
    !secret ||
    Buffer.byteLength(authorization) !== Buffer.byteLength(expected) ||
    !timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const processed = await retryPendingNotifications();
  return NextResponse.json({ processed });
}
