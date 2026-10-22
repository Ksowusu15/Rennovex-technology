"use server";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deliverNotification } from "@/lib/team-notifications";
import { revalidatePath } from "next/cache";

export async function retryNotification(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const id = String(formData.get("id") || "");
  const now = new Date();
  const reset = await prisma.notificationJob.updateMany({
    where: {
      id,
      status: { not: "SENT" },
      OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }],
    },
    data: {
      status: "PENDING",
      attempts: 0,
      nextAttemptAt: now,
      lastError: null,
    },
  });
  if (reset.count === 1) await deliverNotification(id);
  revalidatePath("/admin/notifications");
  revalidatePath("/admin", "layout");
}
