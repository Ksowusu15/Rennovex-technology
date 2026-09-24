"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { getRequestIp } from "@/lib/audit";

export async function archiveActivityLogs() {
  const user = await requireRole(["SUPER_ADMIN"]);
  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });

  if (!logs.length) redirect("/admin/activity?message=No+active+logs+to+archive");

  await prisma.$transaction(async (tx) => {
    await tx.archivedAuditLog.createMany({
      data: logs.map((log) => ({
        originalId: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        details: log.details,
        ipAddress: log.ipAddress,
        originalUserId: log.userId,
        originalUserEmail: log.user?.email 
          ?? null,
        originalCreatedAt: log.createdAt,
        archivedById: user.id,
      })),
    });
    await tx.auditLog.deleteMany();
    await tx.auditLog.create({
      data: {
        action: "ARCHIVE_LOGS",
        entity: "AuditLog",
        details: `Archived ${logs.length} activity log record(s).`,
        userId: user.id,
        ipAddress: await getRequestIp(),
      },
    });
  });

  redirect(`/admin/activity?message=${encodeURIComponent(`${logs.length} activity logs archived successfully`)}`);
}

export async function clearActivityLogs() {
  const user = await requireRole(["SUPER_ADMIN"]);
  const count = await prisma.auditLog.count();
  const ipAddress = await getRequestIp();

  await prisma.$transaction(async (tx) => {
    await tx.auditLog.deleteMany();
    await tx.auditLog.create({
      data: {
        action: "CLEAR_LOGS",
        entity: "AuditLog",
        details: `Permanently cleared ${count} activity log record(s).`,
        userId: user.id,
        ipAddress,
      },
    });
  });

  redirect(`/admin/activity?message=${encodeURIComponent(`${count} activity logs cleared`)}`);
}

export async function clearArchivedLogs() {
  const user = await requireRole(["SUPER_ADMIN"]);
  const count = await prisma.archivedAuditLog.count();
  const ipAddress = await getRequestIp();

  await prisma.$transaction(async (tx) => {
    await tx.archivedAuditLog.deleteMany();
    await tx.auditLog.create({
      data: {
        action: "CLEAR_ARCHIVED_LOGS",
        entity: "ArchivedAuditLog",
        details: `Permanently cleared ${count} archived activity log record(s).`,
        userId: user.id,
        ipAddress,
      },
    });
  });

  redirect(`/admin/activity?view=archived&message=${encodeURIComponent(`${count} archived logs cleared`)}`);
}
