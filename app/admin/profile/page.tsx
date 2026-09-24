import Link from "next/link";
import { BellRing, 
  KeyRound, 
  MonitorSmartphone, 
  ShieldCheck, 
  UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AdminToast } from "@/components/admin-toast";
import { changePassword, 
  updateProfile, 
  updateSecurityPreferences } from "./actions";

const roleLabel = { SUPER_ADMIN: "Super Administrator", 
  ADMIN: "Administrator", 
  EDITOR: "Editor" } as const;

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ success?: string; error?: string }> }) {
  const session = await requireRole(["SUPER_ADMIN", 
    "ADMIN", 
    "EDITOR"]);
  const params = await searchParams;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  return (
    <div className="space-y-6">
      <AdminToast 
        message={params.success 
          || params.error} 
        type={params.error 
          ? "error" 
          : "success"} />
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-700 text-2xl font-bold text-white">
              {user.name.slice(0,
              1).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Administrator profile</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                {user.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {user.email}
              </p>
            </div>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
            <ShieldCheck size={15}/>
            {roleLabel[user.role]}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form 
          action={updateProfile} 
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <UserRound 
            className="text-blue-700" 
            size={19}/>
            <h2 className="text-lg font-bold text-slate-950">Profile details</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Update the name displayed in the admin workspace.</p>
          <label className="mt-5 grid gap-2 text-sm font-semibold text-slate-800">Full name
            <input 
            className="field" 
            name="name" 
            defaultValue={user.name} 
            minLength={2} 
            required />
          </label>
          <label className="mt-4 grid gap-2 text-sm font-semibold text-slate-800">Email address
            <input 
            className="field bg-slate-50" 
            value={user.email} 
            readOnly />
          </label>
          <button className="btn-primary mt-5 w-full justify-center">Save profile</button>
        </form>

        <form 
          id="password" 
          action={changePassword} 
          className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <KeyRound 
            className="text-blue-700" 
            size={19}/>
            <h2 className="text-lg font-bold text-slate-950">Change password</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Use at least 10 characters and avoid reusing a password from another service.</p>
          <div className="mt-5 space-y-4">
            <input 
              className="field" 
              name="currentPassword" 
              type="password" 
              autoComplete="current-password" 
              placeholder="Current password" 
              required />
            <input 
              className="field" 
              name="newPassword" 
              type="password" 
              autoComplete="new-password" 
              placeholder="New password" 
              minLength={10} 
              required />
            <input 
              className="field" 
              name="confirmPassword" 
              type="password" 
              autoComplete="new-password" 
              placeholder="Confirm new password" 
              minLength={10} 
              required />
          </div>
          <button className="btn-primary mt-5 w-full justify-center">Update password</button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-bold text-slate-950">Account security</h2>
          <Link 
          href="/admin/profile/sessions" 
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
            <MonitorSmartphone size={16}/>
          Manage active sessions</Link>
        </div>
        <form 
          action={updateSecurityPreferences} 
          className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <input 
            type="hidden" 
            name="emailNewDeviceAlerts" 
            value="false" />
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="emailNewDeviceAlerts"
              value="true"
              defaultChecked={user.emailNewDeviceAlerts}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-bold text-slate-900">
                <BellRing 
                size={17} 
                className="text-blue-700"/>
                Email me when a new device signs in</span>
              <span className="mt-1 block text-sm leading-6 text-slate-500">Recommended. Rennovex sends an alert only when your
                account is used from a browser and device it has not seen before.</span>
            </span>
          </label>
          <button className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">Save security preference</button>
        </form>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-2 font-semibold text-emerald-700">
              {user.isActive 
              ? "Active" 
              : "Disabled"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Last login</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {user.lastLoginAt 
              ? user.lastLoginAt.toLocaleString() 
              : "No login recorded"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Last IP</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">
              {user.lastLoginIp 
              || "Not recorded"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
