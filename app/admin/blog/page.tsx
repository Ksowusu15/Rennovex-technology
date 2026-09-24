import Link from "next/link";
import {Pencil,
  Trash2,
  Plus} from "lucide-react";
import {prisma} from "@/lib/prisma";
import {savePost,
  deletePost} from "./actions";
import {FormActions} from "@/components/admin-form";
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string;new?:string}>}){const q=await searchParams;
  const items=await prisma.blogPost.findMany({include:{category:true},
  orderBy:{createdAt:"desc"}});
  const edit=q.edit?await prisma.blogPost.findUnique({where:{id:q.edit},
  include:{category:true}}):null;
  const show=!!q.new
    ||!!edit;
  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
    <p className="eyebrow">Manage</p>
  <h1 className="mt-3 text-3xl font-bold text-slate-950">Blog Posts</h1>
  </div>
  <Link 
  href="?new=1" 
  className="btn-primary">
    <Plus size={16}/>
  Add Post</Link>
  </div>{show&&<form 
  action={savePost} 
  className="admin-card mt-7 grid gap-5">
    <input 
  type="hidden" 
  name="id" 
  value={edit?.id
    ||""}/>
  <div className="grid gap-5 md:grid-cols-2">
    <label className="label">Title
  <input 
  className="field" 
  name="title" 
  required 
  defaultValue={edit?.title}/>
  </label>
  <label className="label">Slug
  <input 
  className="field" 
  name="slug" 
  defaultValue={edit?.slug}/>
  </label>
  <label className="label">Category
  <input 
  className="field" 
  name="category" 
  defaultValue={edit?.category?.name
    ||"Development Insights"}/>
  </label>
  <label className="label">Featured image
  <input 
  className="field" 
  name="image" 
  type="file" 
  accept="image/*"/>
  </label>
  </div>
  <label className="label">Excerpt
  <textarea 
  className="field min-h-24" 
  name="excerpt" 
  required 
  defaultValue={edit?.excerpt}/>
  </label>
  <label className="label">Content
  <textarea 
  className="field min-h-64" 
  name="content" 
  required 
  defaultValue={edit?.content}/>
  </label>
  <label className="label max-w-xs">Status
  <select 
  className="field" 
  name="status" 
  defaultValue={edit?.status
    ||"DRAFT"}>
    <option>DRAFT</option>
  <option>PUBLISHED</option>
  <option>ARCHIVED</option>
  </select>
  </label>
  <FormActions editing={!!edit}/>
  </form>}<div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table className="admin-table">
    <thead>
    <tr>
    <th>Title</th>
  <th>Category</th>
  <th>Status</th>
  <th>Actions</th>
  </tr>
  </thead>
  <tbody>
    {items.map(i=><tr key={i.id}>
    <td>
    <b className="text-slate-950">
    {i.title}
  </b>
  </td>
  <td>
    {i.category?.name
    ||"—"}
  </td>
  <td>
    {i.status}
  </td>
  <td>
    <div className="flex gap-2">
    <Link 
  href={`?edit=${i.id}`} 
  className="btn-secondary !rounded-lg !px-3 !py-2">
    <Pencil size={14}/>
  </Link>
  <form action={deletePost}>
    <input 
  type="hidden" 
  name="id" 
  value={i.id}/>
  <button className="btn-danger !px-3">
    <Trash2 size={14}/>
  </button>
  </form>
  </div>
  </td>
  </tr>)}
  </tbody>
  </table>
  </div></>}
