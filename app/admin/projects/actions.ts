"use server";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache"; 
import { redirect } from "next/navigation"; 
import { prisma } from "@/lib/prisma"; 
import { list,
  bool,
  saveUpload,
  removeUpload } from "@/lib/admin"; 
import { slugify } from "@/lib/utils";
export async function saveProject(fd:FormData){await requireRole(["SUPER_ADMIN",
  "ADMIN",
  "EDITOR"]);
  const id=String(fd.get("id")
    ||""); 
  const old=id
    ?await prisma.project.findUnique({where:{id}})
    :null; 
  const image=await saveUpload(fd.get("image") as File, 
  "projects")||old?.image||null; 
  const data={title:String(fd.get("title")),
  slug:slugify(String(fd.get("slug")
    ||fd.get("title"))),
  description:String(fd.get("description")),
  technologies:list(fd.get("technologies")),
  image,
  demoUrl:String(fd.get("demoUrl")
    ||"")
    ||null,
  githubUrl:String(fd.get("githubUrl")
    ||"")
    ||null,
  featured:bool(fd.get("featured")),
  status:String(fd.get("status")) as any}; 
  if(id)await prisma.project.update({where:{id},
  data});else await prisma.project.create({data}); 
  await writeAudit(id
    ?"UPDATE"
    :"CREATE",
  "PROJECT",
  id
    ||undefined,
  String(fd.get("title"))); 
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
  redirect("/admin/projects")}
export async function deleteProject(fd:FormData){await requireRole(["SUPER_ADMIN",
  "ADMIN"]);
  const id=String(fd.get("id"));
  const item=await prisma.project.delete({where:{id}});
  await removeUpload(item.image);
  await writeAudit("DELETE",
  "PROJECT",
  id,
  item.title);
  revalidatePath("/admin/projects");
  revalidatePath("/projects")}
