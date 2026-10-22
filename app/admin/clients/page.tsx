import Link from "next/link";
import type { Prisma } from "@prisma/client";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LifeBuoy,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { initials, pageNumber, workspaceDate } from "@/lib/workspace";
import {
  StatusBadge,
  WorkspaceEmpty,
  WorkspaceHeading,
  WorkspaceMetric,
} from "@/components/workspace/ui";
import { WorkspaceDisclosure } from "@/components/workspace/disclosure";
import { WorkspaceSubmit } from "@/components/workspace/submit-button";
import { createClient, createClientProject } from "./actions";

export const metadata = { title: "Clients | Rennovex Admin" };
const PAGE_SIZE = 10;

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const params = await searchParams;
  const query = (params.q || "").trim().slice(0, 150);
  const status = ["active", "invited", "inactive", "support"].includes(
    params.status || "",
  )
    ? params.status!
    : "all";
  const where: Prisma.ClientWhereInput = {
    ...(query
      ? {
          OR: ["name", "email", "company"].map((field) => ({
            [field]: { contains: query, mode: "insensitive" },
          })),
        }
      : {}),
    ...(status === "active" ? { isActive: true, password: { not: null } } : {}),
    ...(status === "invited" ? { isActive: true, password: null } : {}),
    ...(status === "inactive" ? { isActive: false } : {}),
    ...(status === "support"
      ? {
          supportRequests: {
            some: { status: { in: ["OPEN", "IN_PROGRESS"] } },
          },
        }
      : {}),
  };
  const [total, active, invited, support, matches] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { isActive: true, password: { not: null } } }),
    prisma.client.count({ where: { isActive: true, password: null } }),
    prisma.supportRequest.count({
      where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
    }),
    prisma.client.count({ where }),
  ]);
  const pageCount = Math.max(1, Math.ceil(matches / PAGE_SIZE));
  const page = Math.min(pageNumber(params.page), pageCount);
  const clients = await prisma.client.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      isActive: true,
      createdAt: true,
      inviteDeliveryStatus: true,
      password: true,
      _count: {
        select: {
          projects: true,
          invoices: true,
          supportRequests: {
            where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
          },
        },
      },
    },
  });
  // Project assignment uses all active clients, not just the current search page.
  const assignable = await prisma.client.findMany({
    where: { isActive: true },
    select: { id: true, name: true, company: true },
    orderBy: { name: "asc" },
  });
  const pageHref = (target: number) =>
    `/admin/clients?${new URLSearchParams({ q: query, status, page: String(target) })}`;
  return (
    <div className="admin-client-directory">
      <div>
        <WorkspaceHeading
          eyebrow="Client relationships"
          title="Clients"
          description="A considered home for every client relationship, project and conversation."
          actions={
            <Link href="#invite-client" className="btn-primary">
              <Plus size={17} />
              Invite a client
            </Link>
          }
        />
        <div className="workspace-metrics !mb-0">
          <WorkspaceMetric
            icon={Users}
            label="All clients"
            value={total}
            detail="Across your workspace"
          />
          <WorkspaceMetric
            icon={UserCheck}
            label="Active portal accounts"
            value={active}
            detail="Ready to access their workspace"
            tone="green"
          />
          <WorkspaceMetric
            icon={UserPlus}
            label="Awaiting activation"
            value={invited}
            detail="Invitation not yet accepted"
            tone="violet"
          />
          <WorkspaceMetric
            icon={LifeBuoy}
            label="Open support"
            value={support}
            detail="Requests needing attention"
            tone="amber"
            href="/admin/clients?status=support"
          />
        </div>
      </div>
      <section className="workspace-panel" aria-label="Client directory">
        <div className="workspace-panel-heading">
          <div>
            <h2>Client directory</h2>
            <p>
              {matches} {matches === 1 ? "relationship" : "relationships"}
              {query ? ` matching “${query}”` : " in your workspace"}
            </p>
          </div>
          <span className="workspace-badge">{total} total</span>
        </div>
        <form method="get" className="workspace-toolbar" role="search">
          <label className="workspace-search">
            <span className="sr-only">
              Search clients by name, email or company
            </span>
            <Search size={17} />
            <input
              className="field"
              name="q"
              defaultValue={query}
              placeholder="Search name, company or email…"
            />
          </label>
          <label>
            <span className="sr-only">Filter clients by status</span>
            <select name="status" className="field" defaultValue={status}>
              <option value="all">All clients</option>
              <option value="active">Active accounts</option>
              <option value="invited">Awaiting activation</option>
              <option value="inactive">Deactivated</option>
              <option value="support">With open support</option>
            </select>
          </label>
          <button className="btn-secondary">Apply filters</button>
          {(query || status !== "all") && (
            <Link href="/admin/clients" className="workspace-text-link">
              Clear
            </Link>
          )}
        </form>
        {clients.length ? (
          <div className="workspace-table-wrap">
            <table className="workspace-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Portal access</th>
                  <th>Projects</th>
                  <th>Support</th>
                  <th>Added</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <Link
                        className="workspace-person min-w-[180px]"
                        href={`/admin/clients/${client.id}`}
                      >
                        <span className="workspace-avatar">
                          {initials(client.name)}
                        </span>
                        <span>
                          <strong>{client.name}</strong>
                          <small>{client.company || client.email}</small>
                        </span>
                      </Link>
                    </td>
                    <td>
                      <StatusBadge
                        status={
                          !client.isActive
                            ? "INACTIVE"
                            : client.password
                              ? "ACTIVE"
                              : "INVITED"
                        }
                        label={
                          !client.isActive
                            ? "Deactivated"
                            : client.password
                              ? "Active"
                              : "Awaiting activation"
                        }
                      />
                      {!client.password &&
                        client.inviteDeliveryStatus === "FAILED" && (
                          <p className="mt-1 text-xs text-red-700">
                            Email delivery failed
                          </p>
                        )}
                    </td>
                    <td>
                      <span className="font-semibold tabular-nums">
                        {client._count.projects}
                      </span>
                    </td>
                    <td>
                      {client._count.supportRequests ? (
                        <span className="workspace-badge" data-tone="warning">
                          {client._count.supportRequests} open
                        </span>
                      ) : (
                        <span className="text-slate-400">Clear</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-xs text-slate-500">
                      {workspaceDate(client.createdAt)}
                    </td>
                    <td>
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="workspace-text-link"
                        aria-label={`Manage ${client.name}`}
                      >
                        Manage <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <WorkspaceEmpty
            icon={Users}
            title={
              total
                ? "No clients match these filters"
                : "Your first client starts here"
            }
            description={
              total
                ? "Try another name or clear the filters to view all clients."
                : "Invite a client to give them a dedicated workspace for projects, invoices and support."
            }
            action={
              <Link
                href={total ? "/admin/clients" : "#invite-client"}
                className="btn-secondary"
              >
                {total ? "Clear filters" : "Invite a client"}
              </Link>
            }
          />
        )}
        <div className="workspace-pagination">
          <span>
            {matches
              ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, matches)} of ${matches} clients`
              : "0 clients"}
          </span>
          <nav aria-label="Client directory pages">
            {page > 1 ? (
              <Link className="btn-secondary" href={pageHref(page - 1)}>
                <ChevronLeft size={15} />
                Previous
              </Link>
            ) : (
              <span className="text-slate-400">Previous</span>
            )}
            <span>
              Page {page} of {pageCount}
            </span>
            {page < pageCount ? (
              <Link className="btn-secondary" href={pageHref(page + 1)}>
                Next
                <ChevronRight size={15} />
              </Link>
            ) : (
              <span className="text-slate-400">Next</span>
            )}
          </nav>
        </div>
      </section>
      <div className="admin-client-forms">
        <WorkspaceDisclosure id="invite-client" defaultOpen={total === 0}>
          <summary>
            <UserPlus size={18} />
            Invite a client<span className="ml-auto text-blue-600">+</span>
          </summary>
          <form action={createClient} className="workspace-form-section">
            <p className="mb-5 text-sm leading-6 text-slate-500">
              Create their account and email a private invitation to choose a
              password.
            </p>
            <div className="workspace-form-grid">
              <label className="label">
                Full name
                <input
                  className="field"
                  name="name"
                  placeholder="Client’s full name"
                  required
                  maxLength={100}
                />
              </label>
              <label className="label">
                Company
                <input
                  className="field"
                  name="company"
                  placeholder="Company name (optional)"
                  maxLength={150}
                />
              </label>
              <label className="label">
                Email address
                <input
                  className="field"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  maxLength={150}
                />
              </label>
              <label className="label">
                Phone number
                <input
                  className="field"
                  name="phone"
                  type="tel"
                  placeholder="Phone number (optional)"
                  maxLength={30}
                />
              </label>
            </div>
            <div className="mt-6">
              <WorkspaceSubmit pendingLabel="Creating invitation…">
                <UserPlus size={16} />
                Create & send invitation
              </WorkspaceSubmit>
            </div>
          </form>
        </WorkspaceDisclosure>
        <details className="workspace-details">
          <summary>
            <FolderKanban size={18} />
            Assign a project<span className="ml-auto text-blue-600">+</span>
          </summary>
          <form action={createClientProject} className="workspace-form-section">
            <p className="mb-5 text-sm leading-6 text-slate-500">
              Give a client visibility into a new piece of work.
            </p>
            <div className="workspace-form-grid">
              <label className="label">
                Client
                <select className="field" name="clientId" required>
                  <option value="">Choose a client</option>
                  {assignable.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                      {client.company ? ` · ${client.company}` : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="label">
                Project name
                <input
                  className="field"
                  name="name"
                  required
                  placeholder="e.g. Business website"
                />
              </label>
              <label className="label sm:col-span-2">
                Project summary
                <textarea
                  className="field min-h-24"
                  name="description"
                  placeholder="What will you be delivering?"
                />
              </label>
              <label className="label">
                Target completion
                <input className="field" name="dueDate" type="date" />
              </label>
            </div>
            <button className="btn-primary mt-6" disabled={!assignable.length}>
              <Plus size={16} />
              Assign project
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}
