"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

export async function updateProfile(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) redirect("/admin/profile?error=Enter+a+valid+name");
  await prisma.user.update({ where: { id: session.userId }, data: { name } });
  await writeAudit("UPDATE", "PROFILE", session.userId, "Profile name updated");
  redirect("/admin/profile?success=Profile+updated+successfully");
}

export async function changePassword(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  if (newPassword.length < 10) redirect("/admin/profile?error=New+password+must+be+at+least+10+characters#password");
  if (newPassword !== confirmPassword) redirect("/admin/profile?error=New+password+and+confirmation+do+not+match#password");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) redirect("/admin/profile?error=Current+password+is+incorrect#password");
  await prisma.user.update({ where: { id: session.userId }, data: { password: await bcrypt.hash(newPassword, 12) } });
  await prisma.authSession.updateMany({ where: { userId: session.userId, id: { not: session.sessionId }, revokedAt: null }, data: { revokedAt: new Date() } });
  await writeAudit("PASSWORD_CHANGE", "AUTH", session.userId, "Administrator changed password; other device sessions were ended");
  redirect("/admin/profile?success=Password+changed+successfully#password");
}

export async function updateSecurityPreferences(formData: FormData) {
  const session = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const emailNewDeviceAlerts = formData.getAll("emailNewDeviceAlerts").includes("true");

  await prisma.user.update({
    where: { id: session.userId },
    data: { emailNewDeviceAlerts },
  });

  await writeAudit(
    "UPDATE",
    "SECURITY_PREFERENCES",
    session.userId,
    `New-device login alerts ${emailNewDeviceAlerts ? "enabled" : "disabled"}`,
  );

  redirect("/admin/profile?success=Security+preferences+updated");
}
