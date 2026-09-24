import {
  CircleCheck,
  CircleOff,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { AdminToast } from "@/components/admin-toast";
import { DeleteUserForm } from "@/components/delete-user-form";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import {
  createAdmin,
  revokeUserSessions,
  toggleAdminStatus,
  updateAdminRole,
} from "./actions";

const roleMeta = {
  SUPER_ADMIN: {
    label: "Super Admin",
    description:
      "Full access, users, settings, security and audit logs",
    badge: "bg-violet-50 text-violet-700",
  },
  ADMIN: {
    label: "Admin",
    description: "Content, messages and website settings",
    badge: "bg-blue-50 text-blue-700",
  },
  EDITOR: {
    label: "Editor",
    description:
      "Create and update website content without sensitive access",
    badge: "bg-emerald-50 text-emerald-700",
  },
} as const;

type UsersPageProps = {
  searchParams: Promise<{
    success?: string;
    error?: string;
  }>;
};

export default async function UsersPage({
  searchParams,
}: UsersPageProps) {
  const actor = await requireRole(["SUPER_ADMIN"]);
  const params = await searchParams;

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, 
      { createdAt: "asc" }],
    include: {
      _count: {
        select: {
          authSessions: {
            where: {
              revokedAt: null,
              expiresAt: {
                gt: new Date(),
              },
            },
          },
        },
      },
    },
  });

  const activeUsers = users.filter((user) => user.isActive).length;

  return (
    <div className="space-y-6">
      <AdminToast
        message={params.success 
          || params.error}
        type={params.error 
          ? "error" 
          : "success"}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
              <Users size={21} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Access management
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                Team &amp; Roles
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Create administrators and editors, assign permissions,
                and immediately disable access when needed.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {activeUsers} 
            active accounts
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {Object.entries(roleMeta).map(([role, meta]) => {
            const roleCount = users.filter(
              (user) => user.role === role,
            ).length;

            return (
              <div
                key={role}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">
                    {meta.label}
                  </p>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.badge}`}
                  >
                    {roleCount}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {meta.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <form
          action={createAdmin}
          className="h-fit rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex items-center gap-2">
            <UserPlus 
              className="text-blue-700" 
              size={19} />
            <h2 className="text-lg font-bold text-slate-950">
              Add team member
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create a temporary password and share it securely. The user
            can change it from My Profile.
          </p>

          <div className="mt-5 space-y-4">
            <input
              name="name"
              placeholder="Full name"
              required
              className="field"
            />

            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="field"
            />

            <input
              name="password"
              type="password"
              minLength={10}
              placeholder="Temporary password (10+ characters)"
              required
              className="field"
            />

            <label className="grid gap-2 text-sm font-semibold text-slate-800">
              Assigned role

              
              <select 
                name="role" 
                className="field">
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </label>

            <button className="btn-primary w-full justify-center">
              Create account
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Current team
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Roles are enforced automatically after sign-in.
              </p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-slate-500">
              {users.length} 
              total
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {users.map((user) => {
              const meta = roleMeta[user.role];

              return (
                <div
                  key={user.id}
                  className={`rounded-2xl border p-4 ${
                    user.isActive
                      ? "border-slate-200"
                      : "border-red-100 bg-red-50/40"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 font-bold text-slate-700">
                        {user.name.slice(0, 
                          1).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-slate-900">
                            {user.name}
                          </p>

                          {user.id === actor.userId && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                              You
                            </span>
                          )}

                          {user.role === "SUPER_ADMIN" && (
                            <ShieldCheck
                              size={16}
                              className="text-violet-700"
                            />
                          )}
                        </div>

                        <p className="truncate text-sm text-slate-500">
                          {user.email}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.badge}`}
                          >
                            {meta.label}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                              user.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {user.isActive ? (
                              <CircleCheck size={12} />
                            ) : (
                              <CircleOff size={12} />
                            )}

                            {user.isActive 
                              ? "Active" 
                              : "Disabled"}
                          </span>
                        </div>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          {user.lastLoginAt
                            ? `Last login ${user.lastLoginAt.toLocaleString()}`
                            : "No login yet"}
                          {" "}
                          · 
                          {user._count.authSessions} 
                          active device
                          
                          {user._count.authSessions === 1 
                            ? "" 
                            : "s"}
                        </p>
                      </div>
                    </div>

                    <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-[300px] lg:shrink-0">
                      <form
                        action={updateAdminRole}
                        className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 sm:col-span-2"
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={user.id}
                        />

                        <select
                          name="role"
                          defaultValue={user.role}
                          className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">
                            Super Admin
                          </option>
                        </select>

                        <button className={`
  rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold
  transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700
`}>
                          Save
                        </button>
                      </form>

                      <form action={toggleAdminStatus}>
                        <input
                          type="hidden"
                          name="id"
                          value={user.id}
                        />

                        <button
                          disabled={user.id === actor.userId}
                          className={`w-full whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            user.isActive
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {user.isActive 
                            ? "Disable" 
                            : "Enable"}
                        </button>
                      </form>

                      <form action={revokeUserSessions}>
                        <input
                          type="hidden"
                          name="id"
                          value={user.id}
                        />

                        <button
                          disabled={
                            user._count.authSessions === 0 ||
                            (user.id === actor.userId &&
                              user._count.authSessions === 1)
                          }
                          className={`
  w-full whitespace-nowrap rounded-xl bg-amber-50 px-3 py-2 text-sm
  font-semibold text-amber-800 transition hover:bg-amber-100
  disabled:cursor-not-allowed disabled:opacity-40
`}
                        >
                          End sessions
                        </button>
                      </form>

                      <div className="sm:col-span-2">
                        <DeleteUserForm
                          userId={user.id}
                          userName={user.name}
                          disabled={user.id === actor.userId}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}