"use server";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {saveUpload,
  removeUpload} from "@/lib/admin";
import {slugify} from "@/lib/utils";
export async function savePost(fd:FormData){await requireRole(["SUPER_ADMIN",
  "ADMIN",
  "EDITOR"]);
  const id=String(fd.get("id")
    ||"");
  const old=id
    ?await prisma.blogPost.findUnique({where:{id}})
    :null;
  const image=await saveUpload(fd.get("image") as File, 
  "blog")||old?.image||null;
  const catName=String(fd.get("category")
    ||"General");
  const cat=await prisma.category.upsert({where:{slug:slugify(catName)},
  update:{name:catName},
  create:{name:catName,
  slug:slugify(catName)}});
  const status=String(fd.get("status")) as any;
  const data={title:String(fd.get("title")),
  slug:slugify(String(fd.get("slug")
    ||fd.get("title"))),
  excerpt:String(fd.get("excerpt")),
  content:String(fd.get("content")),
  image,
  status,
  categoryId:cat.id,
  publishedAt:status==="PUBLISHED"
    ?(old?.publishedAt
    ||new Date())
    :null};
  if(id)await prisma.blogPost.update({where:{id},
  data});else await prisma.blogPost.create({data});
  await writeAudit(id
    ?"UPDATE"
    :"CREATE",
  "BLOG_POST",
  id
    ||undefined,
  String(fd.get("title")));
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog")}
export async function deletePost(fd:FormData){await requireRole(["SUPER_ADMIN",
  "ADMIN"]);
  const x=await prisma.blogPost.delete({where:{id:String(fd.get("id"))}});
  await removeUpload(x.image);
  await writeAudit("DELETE",
  "BLOG_POST",
  x.id,
  x.title);
  revalidatePath("/blog");
  revalidatePath("/admin/blog")}
