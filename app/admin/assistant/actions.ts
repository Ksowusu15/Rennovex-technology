"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function updateConversation(fd: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const id = String(fd.get("id"));
  const item = await prisma.chatSession.update({
    where: { id },
    data: {
      visitorName: String(fd.get("visitorName") || "") || null,
      email: String(fd.get("email") || "") || null,
      phone: String(fd.get("phone") || "") || null,
      topic: String(fd.get("topic") || "") || null,
      status: String(fd.get("status")) as any,
    },
  });
  await writeAudit("UPDATE", "CHAT_SESSION", item.id, item.email || item.visitorName || "Visitor");
  revalidatePath("/admin/assistant");
}

export async function deleteConversation(fd: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const item = await prisma.chatSession.delete({ where: { id: String(fd.get("id")) } });
  await writeAudit("DELETE", "CHAT_SESSION", item.id, item.email || item.visitorName || "Visitor");
  revalidatePath("/admin/assistant");
}
