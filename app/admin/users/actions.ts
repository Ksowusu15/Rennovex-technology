"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

const roles = ["SUPER_ADMIN", 
  "ADMIN", 
  "EDITOR"] as const;
type Role = (typeof roles)[number];

export async function createAdmin(formData: FormData) {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const name = String(formData.get("name") 
    || "").trim();
  const email = String(formData.get("email") 
    || "").trim().toLowerCase();
  const password = String(formData.get("password") 
    || "");
  const role = String(formData.get("role") 
    || "EDITOR") as Role;
  if (!name 
    || !email 
    || password.length < 10 
    || !roles.includes(role)) redirect("/admin/users?error=Enter+valid+account+details+and+a+10-character+password");
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) redirect("/admin/users?error=An+account+with+that+email+already+exists");
  const user = await prisma.user.create({ data: { name, 
    email, 
    password: await bcrypt.hash(password, 
    12), 
    role } });
  await writeAudit("CREATE", 
    "USER", 
    user.id, 
    `${actor.email} created ${email} as ${role}`);
  redirect("/admin/users?success=Administrator+account+created+successfully");
}

export async function updateAdminRole(formData: FormData) {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const id = String(formData.get("id"));
  const role = String(formData.get("role")) as Role;
  if (!roles.includes(role)) redirect("/admin/users?error=Invalid+role");
  if (id === actor.userId 
    && role !== "SUPER_ADMIN") redirect("/admin/users?error=You+cannot+remove+your+own+Super+Admin+role");
  const user = await prisma.user.update({ where: { id }, 
    data: { role } });
  await writeAudit("ROLE_CHANGE", 
    "USER", 
    id, 
    `${user.email} changed to ${role}`);
  redirect("/admin/users?success=Role+updated+successfully");
}

export async function toggleAdminStatus(formData: FormData) {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const id = String(formData.get("id"));
  if (id === actor.userId) redirect("/admin/users?error=You+cannot+disable+your+own+account");
  const current = await prisma.user.findUniqueOrThrow({ where: { id } });
  const user = await prisma.user.update({ where: { id }, 
    data: { isActive: !current.isActive } });
  await writeAudit(user.isActive 
    ? "ENABLE" 
    : "DISABLE", 
    "USER", 
    id, 
    user.email);
  redirect(`/admin/users?success=${user.isActive 
    ? "Account+enabled+successfully" 
    : "Account+disabled+successfully"}`);
}


export async function revokeUserSessions(formData: FormData) {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const id = String(formData.get("id") 
    || "");
  if (!id) redirect("/admin/users?error=Invalid+account");
  const target = await prisma.user.findUnique({ where: { id }, 
    select: { email: true } });
  if (!target) redirect("/admin/users?error=Account+not+found");
  const result = await prisma.authSession.updateMany({
    where: { userId: id, 
      revokedAt: null, 
      expiresAt: { gt: new Date() }, 
      ...(id === actor.userId 
        ? { id: { not: actor.sessionId } } 
        : {}) },
    data: { revokedAt: new Date() },
  });
  await writeAudit("ADMIN_REVOKE_SESSIONS", 
    "AUTH_SESSION", 
    id, 
    `${actor.email} ended ${result.count} session(s) for ${target.email}`);
  redirect(`/admin/users?success=${encodeURIComponent(`${result.count} active session(s) ended`)}`);
}


export async function deleteAdminUser(formData: FormData) {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const id = String(formData.get("id") 
    || "").trim();

  if (!id) {
    redirect("/admin/users?error=Invalid+account");
  }

  if (id === actor.userId) {
    redirect("/admin/users?error=You+cannot+delete+your+own+account");
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!target) {
    redirect("/admin/users?error=Account+not+found");
  }

  if (target.role === "SUPER_ADMIN") {
    const superAdminCount = await prisma.user.count({
      where: {
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    if (superAdminCount <= 1) {
      redirect(
        "/admin/users?error=The+last+active+Super+Admin+account+cannot+be+deleted",
      );
    }
  }

  await writeAudit(
    "DELETE",
    "USER",
    target.id,
    `${actor.email} deleted ${target.email} (${target.role})`,
  );

  await prisma.user.delete({
    where: { id: target.id },
  });

  redirect(
    `/admin/users?success=${encodeURIComponent(
      `${target.name} was deleted successfully`,
    )}`,
  );
}
