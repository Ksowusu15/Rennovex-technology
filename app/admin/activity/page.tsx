import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Download, 
  Filter, 
  RefreshCw, 
  ScrollText, 
  ShieldCheck } from "lucide-react";
import { archiveActivityLogs, 
  clearActivityLogs, 
  clearArchivedLogs } from "./actions";
import { ConfirmLogAction } from "./confirm-log-action";

type Search = Promise<{ q?: string; action?: string; view?: string; message?: string }>;

export default async function ActivityPage({ searchParams }: { searchParams: Search }) {
  await requireRole(["SUPER_ADMIN"]);
  const params = await searchParams;
  const archived = params.view === "archived";
  const q = params.q?.trim() 
    ?? "";
  const action = params.action?.trim() 
    ?? "";

  const activeWhere = {
    ...(action 
      ? { action } 
      : {}),
    ...(q ? { OR: [
      { action: { contains: q, 
        mode: "insensitive" as const } },
      { entity: { contains: q, 
        mode: "insensitive" as const } },
      { details: { contains: q, 
        mode: "insensitive" as const } },
      { user: { email: { contains: q, 
        mode: "insensitive" as const } } },
    ] } : {}),
  };
  const archivedWhere = {
    ...(action 
      ? { action } 
      : {}),
    ...(q ? { OR: [
      { action: { contains: q, 
        mode: "insensitive" as const } },
      { entity: { contains: q, 
        mode: "insensitive" as const } },
      { details: { contains: q, 
        mode: "insensitive" as const } },
      { originalUserEmail: { contains: q, 
        mode: "insensitive" as const } },
    ] } : {}),
  };

  const [logs, activeCount, archivedCount, actions] = await Promise.all([
    archived
      ? prisma.archivedAuditLog.findMany({ where: archivedWhere, 
        orderBy: { originalCreatedAt: "desc" }, 
        take: 250 })
      : prisma.auditLog.findMany({ where: activeWhere, 
        include: { user: true }, 
        orderBy: { createdAt: "desc" }, 
        take: 250 }),
    prisma.auditLog.count(),
    prisma.archivedAuditLog.count(),
    prisma.auditLog.findMany({ distinct: ["action"], 
      select: { action: true }, 
      orderBy: { action: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      {params.message 
        && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        {params.message}
      </div>}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <ScrollText />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">Super Admin control</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">Security activity logs</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">Search, export, archive, or clear administrative events.
                Destructive controls are restricted to Super Admins.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link 
              href={`/api/admin/activity/export?view=${archived 
                ? "archived" 
                : "active"}`} 
              className={`
  inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4
  py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50
`}>
              <Download className="h-4 w-4"/>
              Export CSV</Link>
            <Link 
              href={archived 
                ? "/admin/activity?view=archived" 
                : "/admin/activity"} 
              className={`
  inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4
  py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50
`}>
              <RefreshCw className="h-4 w-4"/>
              Refresh</Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-xl">
          <Link 
            href="/admin/activity" 
            className={`rounded-2xl border p-4 ${!archived 
              ? "border-blue-300 bg-blue-50" 
              : "border-slate-200"}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Active logs</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {activeCount}
            </p>
          </Link>
          <Link 
            href="/admin/activity?view=archived" 
            className={`rounded-2xl border p-4 ${archived 
              ? "border-blue-300 bg-blue-50" 
              : "border-slate-200"}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Archived logs</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {archivedCount}
            </p>
          </Link>
        </div>

        <form className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_220px_auto]">
          {archived && <input 
            type="hidden" 
            name="view" 
            value="archived"/>}
          <input 
            name="q" 
            defaultValue={q} 
            placeholder="Search administrator, action, resource or details" 
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"/>
          <select 
            name="action" 
            defaultValue={action} 
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500">
            <option value="">All actions</option>
            {actions.map(item=><option 
            key={item.action} 
            value={item.action}>
              {item.action}
            </option>)}
          </select>
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
            <Filter className="h-4 w-4"/>
            Filter</button>
        </form>

        <div className={`
  mt-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50
  p-4 lg:flex-row lg:items-center lg:justify-between
`}>
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"/>
            <div>
              <p className="font-bold text-amber-950">Protected log management</p>
            <p className="text-sm text-amber-800">Archive is recommended. Clear permanently removes records and cannot be undone.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!archived && <form action={archiveActivityLogs}>
              <ConfirmLogAction 
              kind="archive" 
              label="Archive active logs" 
              message="Archive all active logs? They will remain available in the Archived Logs tab."/>
            </form>}
            {!archived && <form action={clearActivityLogs}>
              <ConfirmLogAction 
              kind="clear" 
              label="Clear active logs" 
              message="Permanently clear all active logs? This cannot be undone."/>
            </form>}
            {archived && <form action={clearArchivedLogs}>
              <ConfirmLogAction 
              kind="clear" 
              label="Clear archived logs" 
              message="Permanently clear every archived log? This cannot be undone."/>
            </form>}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Administrator</th>
              <th className="px-3 py-3">Action</th>
              <th className="px-3 py-3">Resource</th>
              <th className="px-3 py-3">IP</th>
              <th className="px-3 py-3">Details</th>
            </tr>
            </thead>
            <tbody>
              {logs.length ? logs.map((raw:any)=>{const isArchived="originalCreatedAt" in raw; 
              return <tr 
              key={raw.id} 
              className="border-b border-slate-100 align-top hover:bg-slate-50">
                <td className="px-3 py-4 text-slate-500">
                {(isArchived
                ?raw.originalCreatedAt
                :raw.createdAt).toLocaleString()}
              </td>
              <td className="px-3 py-4 font-medium text-slate-800">
                {isArchived
                ?(raw.originalUserEmail
                ??"System")
                :(raw.user?.email
                ??"System")}
              </td>
              <td className="px-3 py-4">
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                {raw.action}
              </span>
              </td>
              <td className="px-3 py-4 text-slate-600">
                {raw.entity}
              </td>
              <td className="px-3 py-4 text-slate-500">
                {raw.ipAddress
                ??"—"}
              </td>
              <td className="max-w-md px-3 py-4 text-slate-500">
                {raw.details
                ??"—"}
              </td>
              </tr>}) : <tr>
                <td 
              colSpan={6} 
              className="px-4 py-14 text-center text-slate-500">No 
              {archived
                ?"archived "
                :""}
              activity logs match your filters.</td>
              </tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
