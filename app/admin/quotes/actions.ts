"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function updateQuote(fd: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const id = String(fd.get("id"));
  const item = await prisma.quoteRequest.update({
    where: { id },
    data: {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      phone: String(fd.get("phone") || "") || null,
      company: String(fd.get("company") || "") || null,
      service: String(fd.get("service")),
      budget: String(fd.get("budget") || "") || null,
      timeline: String(fd.get("timeline") || "") || null,
      requirements: String(fd.get("requirements")),
      status: String(fd.get("status")) as any,
    },
  });
  await writeAudit("UPDATE", "QUOTE_REQUEST", item.id, item.reference);
  revalidatePath("/admin/quotes");
  redirect("/admin/quotes?success=Quote updated successfully");
}

export async function deleteQuote(fd: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const item = await prisma.quoteRequest.delete({ where: { id: String(fd.get("id")) } });
  await writeAudit("DELETE", "QUOTE_REQUEST", item.id, item.reference);
  revalidatePath("/admin/quotes");
}
