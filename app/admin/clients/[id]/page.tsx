import { requireRole } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  addClientFile,
  addClientInvoice,
  addClientMilestone,
  addClientUpdate,
  resendClientInvite,
  toggleClientMilestone,
  toggleClientStatus,
  updateClientInvoice,
  updateClientProject,
  updateSupportStatus,
} from "../actions";

export default async function ClientManagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string; error?: string }>;
}) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const { id } = await params;
  const feedback = await searchParams;
  const notices: Record<string, string> = {
    invited: "Invitation sent. The client can now create their password.",
    "invite-failed":
      "Account saved, but the invitation could not be sent. Use Resend invitation to retry.",
    exists:
      "This email already has a client account. Manage it here or resend its invitation.",
  };

  const client = await prisma.client.findUnique({
    where: {
      id,
    },
    include: {
      projects: {
        orderBy: {
          updatedAt: "desc",
        },
        include: {
          milestones: {
            orderBy: {
              order: "asc",
            },
          },
          files: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      invoices: {
        orderBy: {
          createdAt: "desc",
        },
      },
      supportRequests: {
        orderBy: {
          createdAt: "desc",
        },
      },
      updates: {
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {(feedback.error || (feedback.notice && notices[feedback.notice])) && (
        <p
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
        >
          {feedback.error || notices[feedback.notice!]}
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/clients"
            className="text-sm font-semibold text-blue-600"
          >
            ← Back to clients
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            {client.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {client.company ?? "Rennovex client"} · {client.email}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!client.password && (
            <form action={resendClientInvite}>
              <input name="clientId" type="hidden" value={client.id} />
              <button className="btn-secondary">Resend invitation</button>
            </form>
          )}

          {!client.password && client.inviteDeliveryStatus === "FAILED" && (
            <p className="text-sm font-semibold text-red-700">
              Invitation delivery failed. Retry sending.
            </p>
          )}

          <form action={toggleClientStatus}>
            <input name="clientId" type="hidden" value={client.id} />
            <input
              name="active"
              type="hidden"
              value={String(!client.isActive)}
            />
            <button className="btn-secondary">
              {client.isActive ? "Deactivate access" : "Reactivate access"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <div className="space-y-6">
          {client.projects.map((project) => (
            <section key={project.id} className="surface p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    {project.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {project.description ?? "Client project"}
                  </p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {project.progress}% complete
                </span>
              </div>

              <form
                action={updateClientProject}
                className="mt-5 grid gap-3 sm:grid-cols-[1fr_120px_auto]"
              >
                <input name="clientId" type="hidden" value={client.id} />
                <input name="projectId" type="hidden" value={project.id} />
                <select
                  className="field"
                  name="status"
                  defaultValue={project.status}
                >
                  {[
                    "PLANNING",
                    "IN_PROGRESS",
                    "REVIEW",
                    "COMPLETED",
                    "ON_HOLD",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <input
                  className="field"
                  name="progress"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={project.progress}
                />
                <button className="btn-primary">Update</button>
              </form>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="font-semibold text-slate-900">Milestones</h3>
                  <div className="mt-3 space-y-2">
                    {project.milestones.map((milestone) => (
                      <form
                        key={milestone.id}
                        action={toggleClientMilestone}
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                      >
                        <input
                          name="clientId"
                          type="hidden"
                          value={client.id}
                        />
                        <input
                          name="milestoneId"
                          type="hidden"
                          value={milestone.id}
                        />
                        <input
                          name="completed"
                          type="hidden"
                          value={String(!milestone.completed)}
                        />
                        <span className="text-sm text-slate-700">
                          {milestone.completed ? "✓" : "○"} {milestone.title}
                        </span>
                        <button className="text-xs font-semibold text-blue-600">
                          Toggle
                        </button>
                      </form>
                    ))}
                  </div>

                  <form action={addClientMilestone} className="mt-3 flex gap-2">
                    <input name="clientId" type="hidden" value={client.id} />
                    <input name="projectId" type="hidden" value={project.id} />
                    <input
                      className="field"
                      name="title"
                      placeholder="New milestone"
                      required
                    />
                    <button className="btn-secondary">Add</button>
                  </form>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Deliverables & files
                  </h3>
                  <div className="mt-3 space-y-2">
                    {project.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-blue-700"
                      >
                        {file.name}
                      </a>
                    ))}
                  </div>

                  <form action={addClientFile} className="mt-3 space-y-2">
                    <input name="clientId" type="hidden" value={client.id} />
                    <input name="projectId" type="hidden" value={project.id} />
                    <input
                      className="field"
                      name="name"
                      placeholder="File label"
                      required
                    />
                    <input
                      className="field"
                      name="url"
                      type="url"
                      placeholder="Secure file URL"
                      required
                    />
                    <button className="btn-secondary">Add deliverable</button>
                  </form>
                </div>
              </div>
            </section>
          ))}

          <section className="surface p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">Invoices</h2>

            <div className="mt-4 space-y-3">
              {client.invoices.map((invoice) => (
                <form
                  key={invoice.id}
                  action={updateClientInvoice}
                  className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_150px_130px_auto]"
                >
                  <input name="clientId" type="hidden" value={client.id} />
                  <input name="invoiceId" type="hidden" value={invoice.id} />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {invoice.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {invoice.number} · GH₵
                      {Number(invoice.amount).toLocaleString()}
                    </p>
                  </div>
                  <select
                    className="field"
                    name="status"
                    defaultValue={invoice.status}
                  >
                    {[
                      "DRAFT",
                      "SENT",
                      "PARTIALLY_PAID",
                      "PAID",
                      "OVERDUE",
                      "CANCELLED",
                    ].map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <input
                    className="field"
                    name="paid"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={Number(invoice.paid)}
                  />
                  <button className="btn-secondary">Save</button>
                </form>
              ))}
            </div>

            <form
              action={addClientInvoice}
              className="mt-5 grid gap-3 sm:grid-cols-2"
            >
              <input name="clientId" type="hidden" value={client.id} />
              <input
                className="field"
                name="number"
                placeholder="Invoice number"
                required
              />
              <input
                className="field"
                name="title"
                placeholder="Invoice title"
                required
              />
              <input
                className="field"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount (GHS)"
                required
              />
              <input className="field" name="dueDate" type="date" />
              <button className="btn-primary sm:col-span-2 sm:w-fit">
                Create invoice
              </button>
            </form>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="surface p-5 sm:p-6">
            <h2 className="font-bold text-slate-950">Post project update</h2>
            <form action={addClientUpdate} className="mt-4 space-y-3">
              <input name="clientId" type="hidden" value={client.id} />
              <select className="field" name="projectId">
                <option value="">General update</option>
                {client.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <input
                className="field"
                name="title"
                placeholder="Update title"
                required
              />
              <textarea
                className="field min-h-28"
                name="message"
                placeholder="What changed?"
                required
              />
              <button className="btn-primary">Publish update</button>
            </form>
          </section>

          <section className="surface p-5 sm:p-6">
            <h2 className="font-bold text-slate-950">Support requests</h2>
            <div className="mt-4 space-y-3">
              {client.supportRequests.length === 0 && (
                <p className="text-sm text-slate-500">
                  No support requests yet.
                </p>
              )}
              {client.supportRequests.map((request) => (
                <form
                  key={request.id}
                  action={updateSupportStatus}
                  className="rounded-xl border border-slate-200 p-3"
                >
                  <input name="clientId" type="hidden" value={client.id} />
                  <input name="supportId" type="hidden" value={request.id} />
                  <p className="font-semibold text-slate-900">
                    {request.subject}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {request.message}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <select
                      className="field"
                      name="status"
                      defaultValue={request.status}
                    >
                      {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
                        (status) => (
                          <option key={status} value={status}>
                            {status.replaceAll("_", " ")}
                          </option>
                        ),
                      )}
                    </select>
                    <button className="btn-secondary">Save</button>
                  </div>
                </form>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
