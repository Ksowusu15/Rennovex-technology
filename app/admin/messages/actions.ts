"use server";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {revalidatePath} from "next/cache";
import {prisma} from "@/lib/prisma";
export async function setStatus(fd:FormData){await requireRole(["SUPER_ADMIN",
  "ADMIN"]);
  await prisma.message.update({where:{id:String(fd.get("id"))},
  data:{status:String(fd.get("status")) as any}});
  await writeAudit("STATUS_CHANGE",
  "MESSAGE",
  String(fd.get("id")),
  String(fd.get("status")));
  revalidatePath("/admin/messages")}
export async function deleteMessage(fd:FormData){await requireRole(["SUPER_ADMIN",
  "ADMIN"]);
  const x=await prisma.message.delete({where:{id:String(fd.get("id"))}});
  await writeAudit("DELETE",
  "MESSAGE",
  x.id,
  x.email);
  revalidatePath("/admin/messages")}