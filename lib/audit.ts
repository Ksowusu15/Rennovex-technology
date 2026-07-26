import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getRequestIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export async function writeAudit(action: string, entity: string, entityId?: string, details?: string) {
  try {
    const session = await getSession();
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        details,
        userId: session?.userId,
        ipAddress: await getRequestIp(),
      },
    });
  } catch (error) {
    console.error("Audit log write failed", error);
  }
}
