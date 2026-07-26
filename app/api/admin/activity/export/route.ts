import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

function csv(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export async function GET(request: NextRequest) {
  await requireRole(["SUPER_ADMIN"]);
  const archived = request.nextUrl.searchParams.get("view") === "archived";
  const rows = archived
    ? await prisma.archivedAuditLog.findMany({ orderBy: { originalCreatedAt: "desc" } })
    : await prisma.auditLog.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" } });
  const header = ["Time", "Administrator", "Action", "Resource", "Resource ID", "IP Address", "Details"];
  const lines = rows.map((raw:any) => {
    const isArchived = "originalCreatedAt" in raw;
    return [
      isArchived ? raw.originalCreatedAt.toISOString() : raw.createdAt.toISOString(),
      isArchived ? raw.originalUserEmail : raw.user?.email,
      raw.action, raw.entity, raw.entityId, raw.ipAddress, raw.details,
    ].map(csv).join(",");
  });
  return new NextResponse([header.map(csv).join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=rennovex-${archived ? "archived-" : ""}activity-logs-${new Date().toISOString().slice(0,10)}.csv`,
      "Cache-Control": "no-store",
    },
  });
}
