"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SiteLogo } from "@/components/site-logo";
import { AdminProfileMenu } from "@/components/admin-profile-menu";
import { AdminNotifications } from "@/components/admin-notifications";
import { LogoutButton } from "@/components/logout-button";
import { BookOpenText, BriefcaseBusiness, ExternalLink, FolderKanban, Layers3, LayoutDashboard, Mail, MessageCircleMore, CalendarDays, ReceiptText, Menu, ScrollText, Settings, UserRound, MonitorSmartphone, Users, X } from "lucide-react";

const links = [
  [LayoutDashboard,"Overview","/admin",["SUPER_ADMIN","ADMIN","EDITOR"]],
  [FolderKanban,"Projects","/admin/projects",["SUPER_ADMIN","ADMIN","EDITOR"]],
  [BriefcaseBusiness,"Case Studies","/admin/case-studies",["SUPER_ADMIN","ADMIN","EDITOR"]],
  [BookOpenText,"Blog","/admin/blog",["SUPER_ADMIN","ADMIN","EDITOR"]],
  [Layers3,"Services","/admin/services",["SUPER_ADMIN","ADMIN","EDITOR"]],
  [Mail,"Messages","/admin/messages",["SUPER_ADMIN","ADMIN"]],
  [MessageCircleMore,"Assistant","/admin/assistant",["SUPER_ADMIN","ADMIN"]],
  [ReceiptText,"Quote Requests","/admin/quotes",["SUPER_ADMIN","ADMIN"]],
  [CalendarDays,"Bookings","/admin/bookings",["SUPER_ADMIN","ADMIN"]],
  [Settings,"Settings","/admin/settings",["SUPER_ADMIN","ADMIN"]],
  [Users,"Team & Roles","/admin/users",["SUPER_ADMIN"]],
  [ScrollText,"Activity log","/admin/activity",["SUPER_ADMIN"]],
  [UserRound,"My Profile","/admin/profile",["SUPER_ADMIN","ADMIN","EDITOR"]],
  [MonitorSmartphone,"Active Sessions","/admin/profile/sessions",["SUPER_ADMIN","ADMIN","EDITOR"]],
] as const;

type Session={name:string;email:string;role:"SUPER_ADMIN"|"ADMIN"|"EDITOR"};
type Summary={unreadMessages:number;newQuotes:number;pendingBookings:number;assistantReplies:number};
const roleLabel={SUPER_ADMIN:"Super Administrator",ADMIN:"Administrator",EDITOR:"Editor"} as const;

function Navigation({session,onNavigate}:{session:Session|null;onNavigate?:()=>void}){
 const pathname=usePathname();
 return <nav className="space-y-1">{links.filter(([, , ,roles])=>session&&roles.some(r=>r===session.role)).map(([Icon,label,href])=>{const active=href==="/admin"?pathname===href:pathname.startsWith(href);return <Link key={href} href={href} onClick={onNavigate} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active?"bg-slate-900 text-white":"text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><Icon size={17}/><span>{label}</span></Link>})}</nav>
}

export function AdminShell({children,session,notifications}:{children:React.ReactNode;session:Session|null;notifications:Summary}){
 const pathname=usePathname(); const [open,setOpen]=useState(false);
 useEffect(()=>setOpen(false),[pathname]);
 if(["/admin/login","/admin/forgot-password","/admin/reset-password"].some(r=>pathname.startsWith(r))) return <>{children}</>;
 return <div className="min-h-screen bg-[#f5f6f8] xl:grid xl:grid-cols-[248px_minmax(0,1fr)] 2xl:grid-cols-[268px_minmax(0,1fr)]">
  <aside className="hidden min-h-screen border-r border-slate-200 bg-white xl:sticky xl:top-0 xl:flex xl:h-screen xl:flex-col">
   <div className="border-b border-slate-200 px-5 py-5"><SiteLogo/><p className="mt-2 text-xs font-medium text-slate-400">Enterprise workspace</p></div>
   <div className="flex-1 overflow-y-auto px-3 py-5"><p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[.16em] text-slate-400">Workspace</p><Navigation session={session}/></div>
   <div className="border-t border-slate-200 p-4"><div className="mb-3 px-2"><p className="truncate text-sm font-semibold text-slate-800">{session?.name}</p><p className="truncate text-xs text-slate-500">{session&&roleLabel[session.role]}</p></div><LogoutButton/></div>
  </aside>

  <div className="min-w-0">
   <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
    <div className="flex h-[68px] items-center justify-between gap-3 px-3 sm:px-5 lg:px-6 xl:px-8">
     <div className="flex items-center gap-3"><button onClick={()=>setOpen(true)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 xl:hidden" aria-label="Open navigation"><Menu size={19}/></button><div><p className="text-sm font-semibold text-slate-950">Rennovex Admin</p><p className="hidden text-xs text-slate-500 sm:block">Manage content, enquiries, and operations</p></div></div>
     <div className="flex items-center gap-2">{session&&session.role!=="EDITOR"&&<AdminNotifications summary={notifications}/>}<Link href="/" className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50" aria-label="View website"><ExternalLink size={16}/></Link>{session&&<AdminProfileMenu session={session}/>}</div>
    </div>
   </header>
   <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">{children}</main>
  </div>

  <AnimatePresence>{open&&<><button className="fixed inset-0 z-50 bg-slate-950/45 xl:hidden" onClick={()=>setOpen(false)} aria-label="Close navigation"/><motion.aside initial={{x:"-100%"}} animate={{x:0}} exit={{x:"-100%"}} transition={{duration:.22}} className="fixed inset-y-0 left-0 z-[60] flex w-[86vw] max-w-[320px] flex-col bg-white shadow-2xl xl:hidden"><div className="flex items-center justify-between border-b border-slate-200 p-5"><SiteLogo/><button onClick={()=>setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg border border-slate-300"><X size={18}/></button></div><div className="flex-1 overflow-y-auto p-3"><Navigation session={session} onNavigate={()=>setOpen(false)}/></div><div className="border-t border-slate-200 p-4"><LogoutButton onBeforeLogout={()=>setOpen(false)}/></div></motion.aside></>}</AnimatePresence>
 </div>
}
