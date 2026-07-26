import { Laptop, MonitorSmartphone, ShieldCheck, Smartphone, Tablet, History } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AdminToast } from "@/components/admin-toast";
import { revokeOtherSessions, revokeSession } from "./actions";

function DeviceIcon({ type }: { type: string }) {
  if (type === "Mobile") return <Smartphone size={20}/>;
  if (type === "Tablet") return <Tablet size={20}/>;
  return <Laptop size={20}/>;
}

export default async function SessionsPage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const current = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const params = await searchParams;
  const now = new Date();
  const [sessions, history] = await Promise.all([
    prisma.authSession.findMany({ where: { userId: current.userId, revokedAt: null, expiresAt: { gt: now } }, orderBy: { lastActiveAt: "desc" } }),
    prisma.loginHistory.findMany({ where: { userId: current.userId }, orderBy: { createdAt: "desc" }, take: 12 }),
  ]);
  return <div className="space-y-6">
    <AdminToast message={params.success || params.error} type={params.error ? "error" : "success"} />
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Account security</p><h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Active sessions</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review every device currently signed in to your account and end access remotely.</p></div>
        {sessions.length > 1 && <form action={revokeOtherSessions}><button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 hover:bg-red-100">End all other sessions</button></form>}
      </div>
    </section>
    <section className="grid gap-4">{sessions.map((session) => { const isCurrent = session.id === current.sessionId; return <article key={session.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700"><DeviceIcon type={session.deviceType}/></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-slate-950">{session.deviceName}</h2>{isCurrent && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700"><ShieldCheck size={12}/>Current device</span>}</div><p className="mt-1 text-sm text-slate-500">{session.deviceType} · {session.ipAddress || "IP unavailable"}</p><p className="mt-1 text-xs text-slate-400">Last active {session.lastActiveAt.toLocaleString()} · Expires {session.expiresAt.toLocaleString()}</p></div></div>{!isCurrent && <form action={revokeSession}><input type="hidden" name="id" value={session.id}/><button className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700">End session</button></form>}</div></article>;})}</section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><History className="text-blue-700" size={19}/><h2 className="text-lg font-bold text-slate-950">Recent login history</h2></div><div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400"><th className="py-3 pr-4">Device</th><th className="py-3 pr-4">Result</th><th className="py-3 pr-4">IP</th><th className="py-3">Time</th></tr></thead><tbody>{history.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="py-3 pr-4 font-medium text-slate-800">{item.deviceName}</td><td className={`py-3 pr-4 font-semibold ${item.success ? "text-emerald-700" : "text-red-700"}`}>{item.success ? "Successful" : "Failed"}</td><td className="py-3 pr-4 text-slate-500">{item.ipAddress || "—"}</td><td className="py-3 text-slate-500">{item.createdAt.toLocaleString()}</td></tr>)}</tbody></table></div></section>
  </div>;
}
