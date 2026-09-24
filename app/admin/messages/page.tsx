import {requireRole} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {formatDate} from "@/lib/utils";
import {Trash2} from "lucide-react";
import {setStatus,
  deleteMessage} from "./actions";
export default async function Page(){await requireRole(["SUPER_ADMIN",
  "ADMIN"]);
  const items=await prisma.message.findMany({orderBy:{createdAt:"desc"}});
  return <><p className="eyebrow">Inbox</p><h1 className="mt-3 text-3xl font-bold text-slate-950">Contact Messages</h1><div className="mt-7 grid gap-4">
    {items.map(i=><article 
  key={i.id} 
  className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${i.status==="UNREAD"
    ?"border-sky-300"
    :"border-slate-200"}`}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
    <h2 className="font-bold text-slate-950">
    {i.name}
  </h2>
  <a 
  href={`mailto:${i.email}`} 
  className="text-sm text-sky-700">
    {i.email}
  </a>
  {i.phone
    &&<p className="mt-1 text-xs text-slate-500">
    {i.phone}
  </p>}
  </div>
  <div className="flex flex-wrap items-center gap-2">
    <form action={setStatus}>
    <input 
  type="hidden" 
  name="id" 
  value={i.id}/>
  <select 
  name="status" 
  defaultValue={i.status} 
  className="rounded-lg border border-slate-300 px-3 py-2 text-xs">
    <option>UNREAD</option>
  <option>READ</option>
  <option>ARCHIVED</option>
  </select>
  <button className="ml-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white">Save</button>
  </form>
  <form action={deleteMessage}>
    <input 
  type="hidden" 
  name="id" 
  value={i.id}/>
  <button className="btn-danger !px-3">
    <Trash2 size={14}/>
  </button>
  </form>
  </div>
  </div>
  <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">
    {i.message}
  </p>
  <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
    <span>
    {i.projectType
    ?`Project: ${i.projectType}`
    :"General enquiry"}
  </span>
  <span>
    {formatDate(i.createdAt)}
  </span>
  </div>
  </article>)}
  {items.length===0
    &&<div className="admin-card text-slate-500">No messages yet.</div>}
  </div></>}
