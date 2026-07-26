import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    return NextResponse.json(await getSiteSettings(), {
      headers: noStoreHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        id: "main",
        companyName: "Rennovex Technology",
        logoUrl: null,
        contactEmail: null,
      },
      { headers: noStoreHeaders },
    );
  }
}
