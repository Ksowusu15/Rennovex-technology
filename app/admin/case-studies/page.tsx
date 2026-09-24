import Link from "next/link";
import {Pencil,
  Trash2,
  Plus} from "lucide-react";
import {prisma} from "@/lib/prisma";
import {saveStudy,
  deleteStudy} from "./actions";
import {FormActions} from "@/components/admin-form";
export default async function Page({searchParams}:{searchParams:Promise<{edit?:string;new?:string}>}){const q=await searchParams;
  const items=await prisma.caseStudy.findMany({orderBy:{createdAt:"desc"}});
  const edit=q.edit
    ?await prisma.caseStudy.findUnique({where:{id:q.edit}})
    :null;
  const show=!!q.new
    ||!!edit;
  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
    <p className="eyebrow">Manage</p>
  <h1 className="mt-3 text-3xl font-bold text-slate-950">Case Studies</h1>
  </div>
  <Link 
  href="?new=1" 
  className="btn-primary">
    <Plus size={16}/>
  Add Case Study</Link>
  </div>{show&&<form 
  action={saveStudy} 
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
  </div>
  <label className="label">Overview
  <textarea 
  className="field min-h-24" 
  name="overview" 
  required 
  defaultValue={edit?.overview}/>
  </label>
  <div className="grid gap-5 lg:grid-cols-2">
    <label className="label">Challenge
  <textarea 
  className="field min-h-32" 
  name="challenge" 
  required 
  defaultValue={edit?.challenge}/>
  </label>
  <label className="label">Solution
  <textarea 
  className="field min-h-32" 
  name="solution" 
  required 
  defaultValue={edit?.solution}/>
  </label>
  <label className="label">Process
  <textarea 
  className="field min-h-32" 
  name="process" 
  required 
  defaultValue={edit?.process}/>
  </label>
  <label className="label">Results
  <textarea 
  className="field min-h-32" 
  name="results" 
  required 
  defaultValue={edit?.results}/>
  </label>
  </div>
  <div className="grid gap-5 md:grid-cols-2">
    <label className="label">Technologies
  <input 
  className="field" 
  name="technologies" 
  defaultValue={edit?.technologies.join(", ")}/>
  </label>
  <label className="label">Image
  <input 
  className="field" 
  name="image" 
  type="file" 
  accept="image/*"/>
  </label>
  <label className="label">Project URL
  <input 
  className="field" 
  name="projectUrl" 
  type="url" 
  defaultValue={edit?.projectUrl
    ||""}/>
  </label>
  <label className="label">Status
  <select 
  className="field" 
  name="status" 
  defaultValue={edit?.status
    ||"PUBLISHED"}>
    <option>DRAFT</option>
  <option>PUBLISHED</option>
  <option>ARCHIVED</option>
  </select>
  </label>
  <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
    <input 
  name="featured" 
  type="checkbox" 
  defaultChecked={edit?.featured}/>
  Featured case study</label>
  </div>
  <FormActions editing={!!edit}/>
  </form>}<div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
    <table className="admin-table">
    <thead>
    <tr>
    <th>Title</th>
  <th>Status</th>
  <th>Featured</th>
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
    {i.status}
  </td>
  <td>
    {i.featured
    ?"Yes"
    :"No"}
  </td>
  <td>
    <div className="flex gap-2">
    <Link 
  href={`?edit=${i.id}`} 
  className="btn-secondary !rounded-lg !px-3 !py-2">
    <Pencil size={14}/>
  </Link>
  <form action={deleteStudy}>
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
