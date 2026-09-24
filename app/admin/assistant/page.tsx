import { Bot, 
  UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { deleteConversation, 
  updateConversation } from "./actions";

export default async function AssistantAdminPage(){
 await requireRole(["SUPER_ADMIN",
   "ADMIN"]);
 const sessions=await prisma.chatSession.findMany({orderBy:{updatedAt:"desc"},
   take:100,
   include:{messages:{orderBy:{createdAt:"asc"},
   take:8}}});
 return <div className="space-y-6">
   <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
   <div>
   <p className="eyebrow">Lead conversations</p>
   <h1 className="mt-2 text-3xl font-bold text-slate-950">Rennovex Assistant</h1>
   <p className="mt-2 text-slate-600">Edit contact details, manage conversation status, and remove irrelevant sessions.</p>
 </div>
   <a 
   href="/api/admin/exports?type=assistant" 
   className="btn-secondary !py-2.5">Export CSV</a>
 </div>
   <div className="grid gap-4 xl:grid-cols-2">
     {sessions.map(s=><article 
   key={s.id} 
   className="admin-card">
     <div className="flex items-start justify-between gap-3">
     <div className="flex items-center gap-3">
     <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-700">
     <UserRound size={20}/>
   </div>
   <div>
     <h2 className="font-bold text-slate-900">
     {s.visitorName
     ||"Website visitor"}
   </h2>
   <p className="text-sm text-slate-500">
     {s.email
     ||"Email not provided"}
   </p>
   </div>
   </div>
   <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${s.status==="NEEDS_REPLY"
     ?"bg-amber-100 text-amber-700"
     :"bg-slate-100 text-slate-600"}`}>
     {s.status.replaceAll("_",
   " ")}
   </span>
   </div>
   <div className="mt-4 max-h-64 space-y-2 overflow-y-auto rounded-2xl bg-slate-50 p-3">
     {s.messages.map(m=><div 
   key={m.id} 
   className={`rounded-xl px-3 py-2 text-sm leading-6 ${m.sender==="VISITOR"
     ?"ml-8 bg-blue-700 text-white"
     :"mr-8 border border-slate-200 bg-white text-slate-700"}`}>
     {m.content}
   </div>)}
   </div>
   <form 
   action={updateConversation} 
   className="mt-4 grid gap-3 sm:grid-cols-2">
     <input 
   type="hidden" 
   name="id" 
   value={s.id}/>
   <input 
   className="field" 
   name="visitorName" 
   placeholder="Visitor name" 
   defaultValue={s.visitorName
     ||""}/>
   <input 
   className="field" 
   type="email" 
   name="email" 
   placeholder="Email" 
   defaultValue={s.email
     ||""}/>
   <input 
   className="field" 
   name="phone" 
   placeholder="Phone" 
   defaultValue={s.phone
     ||""}/>
   <input 
   className="field" 
   name="topic" 
   placeholder="Topic" 
   defaultValue={s.topic
     ||""}/>
   <select 
   className="field" 
   name="status" 
   defaultValue={s.status}>
     <option>OPEN</option>
   <option>NEEDS_REPLY</option>
   <option>RESOLVED</option>
   <option>ARCHIVED</option>
   </select>
   <button className="btn-primary justify-center">Save</button>
   </form>
   <div className="mt-4 flex items-center justify-between gap-3">
     <p className="text-xs text-slate-400">Updated 
   {formatDate(s.updatedAt)}
   </p>
   <form action={deleteConversation}>
     <input 
   type="hidden" 
   name="id" 
   value={s.id}/>
   <ConfirmDeleteButton message="Delete this entire conversation and all its messages? This cannot be undone."/>
   </form>
   </div>
   </article>)}
   {sessions.length===0&&<div className="admin-card xl:col-span-2 py-14 text-center">
     <Bot 
   className="mx-auto text-slate-300" 
   size={34}/>
   <p className="mt-3 font-semibold text-slate-700">No assistant conversations yet</p>
   </div>}
   </div>
 </div>
}
