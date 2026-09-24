"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

export async function revokeSession(formData: FormData) {
  const user = await requireRole(["SUPER_ADMIN", 
    "ADMIN", 
    "EDITOR"]);
  const id = String(formData.get("id") 
    || "");
  if (!id 
    || id === user.sessionId) redirect("/admin/profile/sessions?error=You+cannot+end+the+current+session+from+this+button");
  const result = await prisma.authSession.updateMany({ where: { id, 
    userId: user.userId, 
    revokedAt: null }, 
    data: { revokedAt: new Date() } });
  if (result.count) await writeAudit("SESSION_REVOKED", 
    "AUTH_SESSION", 
    id, 
    "User ended a device session");
  revalidatePath("/admin/profile/sessions");
  redirect("/admin/profile/sessions?success=Session+ended");
}

export async function revokeOtherSessions() {
  const user = await requireRole(["SUPER_ADMIN", 
    "ADMIN", 
    "EDITOR"]);
  const result = await prisma.authSession.updateMany({ where: { userId: user.userId, 
    id: { not: user.sessionId }, 
    revokedAt: null, 
    expiresAt: { gt: new Date() } }, 
    data: { revokedAt: new Date() } });
  await writeAudit("OTHER_SESSIONS_REVOKED", 
    "AUTH_SESSION", 
    undefined, 
    `${result.count} other session(s) ended`);
  revalidatePath("/admin/profile/sessions");
  redirect("/admin/profile/sessions?success=All+other+sessions+ended");
}
