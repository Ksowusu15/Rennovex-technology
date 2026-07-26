"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function updateBooking(fd: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const id = String(fd.get("id"));
  const item = await prisma.consultationBooking.update({
    where: { id },
    data: {
      name: String(fd.get("name")),
      email: String(fd.get("email")),
      phone: String(fd.get("phone") || "") || null,
      company: String(fd.get("company") || "") || null,
      service: String(fd.get("service") || "") || null,
      preferredDate: new Date(String(fd.get("preferredDate"))),
      notes: String(fd.get("notes") || "") || null,
      status: String(fd.get("status")) as any,
    },
  });
  await writeAudit("UPDATE", "CONSULTATION_BOOKING", item.id, item.reference);
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings?success=Booking updated successfully");
}

export async function deleteBooking(fd: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const item = await prisma.consultationBooking.delete({ where: { id: String(fd.get("id")) } });
  await writeAudit("DELETE", "CONSULTATION_BOOKING", item.id, item.reference);
  revalidatePath("/admin/bookings");
}
