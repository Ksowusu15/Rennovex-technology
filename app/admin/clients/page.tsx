import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createClient, createClientProject } from "./actions";

export const metadata = {
  title: "Clients | Rennovex Admin",
};

export default async function AdminClientsPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const clients = await prisma.client.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      projects: true,
      invoices: true,
      supportRequests: {
        where: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-600">Client operations</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Clients</h1>
        <p className="mt-2 text-sm text-slate-500">
          Invite clients, assign projects and manage their portal workspace.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form action={createClient} className="surface p-5 sm:p-6">
          <h2 className="font-bold text-slate-950">Invite a client</h2>
          <p className="mt-2 text-sm text-slate-500">
            The client receives a secure invitation to create their password.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="label">
              Client name
              <input className="field" name="name" required />
            </label>

            <label className="label">
              Company
              <input className="field" name="company" />
            </label>

            <label className="label">
              Email
              <input className="field" name="email" type="email" required />
            </label>

            <label className="label">
              Phone
              <input className="field" name="phone" />
            </label>
          </div>

          <button className="btn-primary mt-5">Create & send invitation</button>
        </form>

        <form action={createClientProject} className="surface p-5 sm:p-6">
          <h2 className="font-bold text-slate-950">Assign a project</h2>

          <div className="mt-5 space-y-4">
            <label className="label">
              Client
              <select className="field" name="clientId" required>
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.company ? ` — ${client.company}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="label">
              Project name
              <input className="field" name="name" required />
            </label>

            <label className="label">
              Description
              <textarea className="field min-h-24" name="description" />
            </label>

            <label className="label">
              Expected completion
              <input className="field" name="dueDate" type="date" />
            </label>
          </div>

          <button className="btn-primary mt-5">Assign project</button>
        </form>
      </div>

      <div className="surface overflow-hidden">
        <div className="border-b border-slate-200 p-5 sm:p-6">
          <h2 className="font-bold text-slate-950">Client accounts</h2>
        </div>

        <div className="divide-y divide-slate-200">
          {clients.length === 0 && (
            <p className="p-6 text-sm text-slate-500">No clients created yet.</p>
          )}

          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/admin/clients/${client.id}`}
              className={[
                "grid gap-4 p-5 transition",
                "hover:bg-slate-50 sm:grid-cols-2",
                "lg:grid-cols-5 sm:p-6",
              ].join(" ")}
            >
              <div>
                <p className="font-semibold text-slate-950">{client.name}</p>
                <p className="text-sm text-slate-500">
                  {client.company ?? client.email}
                </p>
                <p className="mt-1 text-xs font-semibold text-blue-600">
                  {client.password ? "Portal active" : "Invitation pending"}
                </p>
              </div>

              <Stat label="Projects" value={client.projects.length} />
              <Stat label="Invoices" value={client.invoices.length} />
              <Stat label="Open support" value={client.supportRequests.length} />

              <div className="flex items-center lg:justify-end">
                <span className="text-sm font-semibold text-blue-600">
                  Manage client →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
