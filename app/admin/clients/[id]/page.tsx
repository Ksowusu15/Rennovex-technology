import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  Check,
  FileText,
  FolderKanban,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  UserPlus,
} from "lucide-react";
import { invoiceTotals } from "@/lib/client-workspace";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeFileUrl } from "@/lib/safe-url";
import {
  initials,
  statusLabel,
  workspaceDate,
  workspaceMoney,
} from "@/lib/workspace";
import {
  StatusBadge,
  WorkspaceEmpty,
  WorkspacePanel,
} from "@/components/workspace/ui";
import { WorkspaceSubmit } from "@/components/workspace/submit-button";
import {
  addClientFile,
  addClientInvoice,
  addClientMilestone,
  addClientUpdate,
  createClientProject,
  resendClientInvite,
  toggleClientMilestone,
  toggleClientStatus,
  updateClientInvoice,
  updateClientProject,
  updateSupportStatus,
} from "../actions";

const views = [
  "overview",
  "projects",
  "invoices",
  "support",
  "updates",
] as const;
const notices: Record<string, string> = {
  invited: "Invitation sent. The client can now create their password.",
  "invite-failed":
    "The account is saved, but the invitation could not be sent. Use Resend invitation to retry.",
  exists: "This email already has a client account. You can manage it here.",
};
export default async function ClientManagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string; notice?: string; error?: string }>;
}) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const { id } = await params;
  const feedback = await searchParams;
  const view = views.find((value) => value === feedback.view) || "overview";
  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        include: {
          milestones: { orderBy: { order: "asc" } },
          files: { orderBy: { createdAt: "desc" } },
        },
      },
      invoices: { orderBy: { createdAt: "desc" } },
      supportRequests: { orderBy: { createdAt: "desc" } },
      updates: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!client) notFound();
  const openSupport = client.supportRequests.filter((item) =>
    ["OPEN", "IN_PROGRESS"].includes(item.status),
  ).length;
  const activeProjects = client.projects.filter(
    (item) => !["COMPLETED", "ON_HOLD"].includes(item.status),
  ).length;
  const outstanding =
    invoiceTotals(client.invoices)
      .filter((item) => item.outstanding > 0)
      .map((item) => workspaceMoney(item.outstanding, item.currency))
      .join(" · ") || workspaceMoney(0);
  const field = <input type="hidden" name="clientId" value={client.id} />;
  const clientHref = (target: string) =>
    `/admin/clients/${client.id}?view=${target}`;
  const timeline = client.updates.length ? (
    <div className="workspace-timeline">
      {client.updates.map((update) => (
        <article className="workspace-timeline-item" key={update.id}>
          <h3>{update.title}</h3>
          <time>{workspaceDate(update.createdAt)}</time>
          <p>{update.message}</p>
        </article>
      ))}
    </div>
  ) : (
    <WorkspaceEmpty
      icon={MessageSquare}
      title="No updates published"
      description="Keep this client informed with a clear, useful project update."
    />
  );
  return (
    <div>
      <Link href="/admin/clients" className="workspace-text-link mb-4">
        <ArrowLeft size={15} />
        Client directory
      </Link>
      {(feedback.error || (feedback.notice && notices[feedback.notice])) && (
        <p
          role={feedback.error ? "alert" : "status"}
          className="workspace-callout mb-5"
          data-tone="warning"
        >
          {feedback.error || notices[feedback.notice!]}
        </p>
      )}
      <section className="admin-client-identity">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="admin-client-identity-top">
            <span className="workspace-avatar">{initials(client.name)}</span>
            <div>
              <p className="workspace-eyebrow">Client workspace</p>
              <h1>{client.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {client.company || "Individual client"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
                  ? "Access deactivated"
                  : client.password
                    ? "Portal active"
                    : "Awaiting activation"
              }
            />
            {!client.password && client.isActive && (
              <form action={resendClientInvite}>
                {field}
                <WorkspaceSubmit secondary pendingLabel="Sending…">
                  <UserPlus size={15} />
                  Resend invitation
                </WorkspaceSubmit>
              </form>
            )}
          </div>
        </div>
        <div className="admin-client-contact">
          <a href={`mailto:${client.email}`}>
            <Mail size={14} />
            {client.email}
          </a>
          {client.phone && (
            <a href={`tel:${client.phone}`}>
              <Phone size={14} />
              {client.phone}
            </a>
          )}
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={14} />
            Client since {workspaceDate(client.createdAt)}
          </span>
        </div>
        {!client.password && client.inviteDeliveryStatus === "FAILED" && (
          <p className="workspace-callout mt-4" data-tone="warning">
            The last invitation email failed. Check your email delivery settings
            and resend the invitation.
          </p>
        )}
        <div className="admin-client-stats">
          <div>
            <p>Active projects</p>
            <strong>{activeProjects}</strong>
          </div>
          <div>
            <p>Outstanding balance</p>
            <strong>{outstanding}</strong>
          </div>
          <div>
            <p>Open support</p>
            <strong>
              {openSupport} {openSupport === 1 ? "request" : "requests"}
            </strong>
          </div>
          <div>
            <p>Last sign-in</p>
            <strong>
              {client.lastLoginAt
                ? workspaceDate(client.lastLoginAt)
                : "Not signed in yet"}
            </strong>
          </div>
        </div>
      </section>
      <nav className="workspace-tabs" aria-label="Client management sections">
        {views.map((tab) => (
          <Link
            key={tab}
            href={clientHref(tab)}
            aria-current={view === tab ? "page" : undefined}
          >
            {tab === "invoices" ? "Invoices & payments" : statusLabel(tab)}
            {tab === "support" && openSupport > 0 && (
              <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                {openSupport}
              </span>
            )}
          </Link>
        ))}
      </nav>
      {view === "overview" && (
        <div className="admin-client-grid">
          <div className="grid gap-6">
            <WorkspacePanel
              title="Project overview"
              description="A snapshot of the work you are delivering"
              action={
                <Link
                  href={clientHref("projects")}
                  className="workspace-text-link"
                >
                  Manage projects
                  <ArrowRight size={15} />
                </Link>
              }
            >
              {client.projects.length ? (
                client.projects.map((project) => (
                  <div className="workspace-list-row" key={project.id}>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <strong className="text-sm font-semibold">
                          {project.name}
                        </strong>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {project.dueDate
                          ? `Target ${workspaceDate(project.dueDate)}`
                          : "No target date set"}{" "}
                        · {project.progress}% complete
                      </p>
                      <div className="workspace-progress mt-3">
                        <span style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <WorkspaceEmpty
                  icon={FolderKanban}
                  title="No projects assigned"
                  description="Assign the first project to start building this client’s workspace."
                  action={
                    <Link
                      className="btn-secondary"
                      href={clientHref("projects")}
                    >
                      Assign a project
                    </Link>
                  }
                />
              )}
            </WorkspacePanel>
            <WorkspacePanel
              title="Latest client updates"
              description="Messages visible in their portal"
              action={
                <Link
                  href={clientHref("updates")}
                  className="workspace-text-link"
                >
                  Publish update
                  <Plus size={15} />
                </Link>
              }
            >
              {timeline}
            </WorkspacePanel>
          </div>
          <div className="grid gap-5">
            <WorkspacePanel title="Client details">
              <dl className="grid gap-5 p-6 text-sm">
                <div>
                  <dt className="text-xs text-slate-500">Contact person</dt>
                  <dd className="mt-1 font-medium">{client.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Organisation</dt>
                  <dd className="mt-1 font-medium">
                    {client.company || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Phone</dt>
                  <dd className="mt-1 font-medium">
                    {client.phone || "Not provided"}
                  </dd>
                </div>
              </dl>
            </WorkspacePanel>
            <div className="workspace-panel admin-mini-panel">
              <LifeBuoy size={20} className="mb-3 text-blue-600" />
              <h3>Keep support moving</h3>
              <p>
                {openSupport
                  ? `${openSupport} open requests are waiting for a status update or follow-up.`
                  : "No open requests. All client support is up to date."}
              </p>
              <Link
                className="workspace-text-link mt-3"
                href={clientHref("support")}
              >
                Review support
                <ArrowRight size={15} />
              </Link>
            </div>
            <details className="workspace-details">
              <summary>Portal access settings</summary>
              <div className="workspace-form-section">
                <p className="mb-4 text-sm leading-6 text-slate-500">
                  {client.isActive
                    ? "Deactivate access to prevent this client from signing in. Their project and invoice records will be kept."
                    : "Reactivate access to let this client sign in again."}
                </p>
                <form action={toggleClientStatus}>
                  {field}
                  <input
                    type="hidden"
                    name="active"
                    value={String(!client.isActive)}
                  />
                  <WorkspaceSubmit secondary>
                    {client.isActive
                      ? "Deactivate access"
                      : "Reactivate access"}
                  </WorkspaceSubmit>
                </form>
              </div>
            </details>
          </div>
        </div>
      )}
      {view === "projects" && (
        <div className="grid gap-6">
          <WorkspacePanel
            title="Client projects"
            description="Manage progress, milestones and deliverables"
          >
            {client.projects.length ? (
              client.projects.map((project) => (
                <article key={project.id} className="admin-project-editor">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3>{project.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {project.description || "No project summary provided."}
                      </p>
                      {project.dueDate && (
                        <p className="mt-2 text-xs text-slate-500">
                          Target completion: {workspaceDate(project.dueDate)}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <form
                    action={updateClientProject}
                    className="grid gap-4 sm:grid-cols-[1fr_140px_auto] sm:items-end"
                  >
                    {field}
                    <input name="projectId" type="hidden" value={project.id} />
                    <label className="label">
                      Project stage
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
                            {statusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="label">
                      Progress (%)
                      <input
                        className="field"
                        type="number"
                        name="progress"
                        min={0}
                        max={100}
                        required
                        defaultValue={project.progress}
                      />
                    </label>
                    <WorkspaceSubmit>Save progress</WorkspaceSubmit>
                  </form>
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="mb-3 text-sm font-semibold">Milestones</h4>
                      {project.milestones.length === 0 && (
                        <p className="mb-3 text-xs text-slate-500">
                          Break the project into clear steps.
                        </p>
                      )}
                      {project.milestones.map((milestone) => (
                        <form
                          action={toggleClientMilestone}
                          key={milestone.id}
                          className="mb-2 flex items-center justify-between gap-3 border-b border-slate-100 pb-2"
                        >
                          {field}
                          <input
                            type="hidden"
                            name="milestoneId"
                            value={milestone.id}
                          />
                          <input
                            type="hidden"
                            name="completed"
                            value={String(!milestone.completed)}
                          />
                          <span className="flex min-w-0 items-center gap-2 text-sm">
                            {milestone.completed ? (
                              <Check
                                size={16}
                                className="shrink-0 text-emerald-600"
                              />
                            ) : (
                              <span className="h-3 w-3 shrink-0 rounded-full border border-slate-300" />
                            )}
                            {milestone.title}
                          </span>
                          <button
                            className="workspace-text-link shrink-0"
                            aria-label={`${milestone.completed ? "Reopen" : "Complete"} milestone ${milestone.title}`}
                          >
                            {milestone.completed ? "Reopen" : "Complete"}
                          </button>
                        </form>
                      ))}
                      <form
                        action={addClientMilestone}
                        className="mt-4 grid gap-3"
                      >
                        {field}
                        <input
                          type="hidden"
                          name="projectId"
                          value={project.id}
                        />
                        <label className="label">
                          Add a milestone
                          <input
                            className="field"
                            name="title"
                            required
                            placeholder="e.g. Design approved"
                          />
                        </label>
                        <WorkspaceSubmit secondary>
                          <Plus size={15} />
                          Add milestone
                        </WorkspaceSubmit>
                      </form>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="mb-3 text-sm font-semibold">
                        Deliverables & files
                      </h4>
                      {!project.files.length && (
                        <p className="mb-3 text-xs text-slate-500">
                          Share the files this client needs.
                        </p>
                      )}
                      {project.files.map((file) => {
                        const url = safeFileUrl(file.url);
                        return url ? (
                          <a
                            href={url}
                            key={file.id}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="workspace-text-link mb-2 flex break-all"
                          >
                            <FileText size={15} className="shrink-0" />
                            {file.name}
                          </a>
                        ) : (
                          <p key={file.id} className="text-xs text-slate-500">
                            {file.name} · Link unavailable
                          </p>
                        );
                      })}
                      <form action={addClientFile} className="mt-4 grid gap-3">
                        {field}
                        <input
                          type="hidden"
                          name="projectId"
                          value={project.id}
                        />
                        <label className="label">
                          File name
                          <input
                            className="field"
                            name="name"
                            required
                            placeholder="e.g. Brand guidelines"
                          />
                        </label>
                        <label className="label">
                          Secure file link
                          <input
                            className="field"
                            name="url"
                            type="url"
                            required
                            placeholder="https://…"
                          />
                        </label>
                        <WorkspaceSubmit secondary>
                          <Plus size={15} />
                          Add deliverable
                        </WorkspaceSubmit>
                      </form>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <WorkspaceEmpty
                icon={FolderKanban}
                title="No projects yet"
                description="Use the form below to create this client’s first project."
              />
            )}
          </WorkspacePanel>
          <WorkspacePanel
            title="Assign a new project"
            description="It will appear in this client’s portal"
          >
            <form
              action={createClientProject}
              className="workspace-form-section"
            >
              {field}
              <div className="workspace-form-grid">
                <label className="label">
                  Project name
                  <input name="name" className="field" required />
                </label>
                <label className="label">
                  Target completion
                  <input name="dueDate" className="field" type="date" />
                </label>
                <label className="label sm:col-span-2">
                  Project summary
                  <textarea className="field min-h-24" name="description" />
                </label>
              </div>
              <div className="mt-5">
                <WorkspaceSubmit>
                  <Plus size={16} />
                  Assign project
                </WorkspaceSubmit>
              </div>
            </form>
          </WorkspacePanel>
        </div>
      )}
      {view === "invoices" && (
        <div className="grid gap-6">
          <WorkspacePanel
            title="Invoices & payments"
            description="Keep payment amounts aligned with each invoice’s status"
          >
            {client.invoices.length ? (
              client.invoices.map((invoice) => (
                <form
                  action={updateClientInvoice}
                  className="admin-invoice-form"
                  key={invoice.id}
                >
                  {field}
                  <input type="hidden" name="invoiceId" value={invoice.id} />
                  <div>
                    <p className="text-xs text-slate-500">{invoice.number}</p>
                    <h3 className="mt-1 font-semibold">{invoice.title}</h3>
                    <p className="mt-2 text-sm font-semibold">
                      {workspaceMoney(
                        invoice.amount.toString(),
                        invoice.currency,
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {invoice.dueDate
                        ? `Due ${workspaceDate(invoice.dueDate)}`
                        : "No due date"}
                    </p>
                  </div>
                  <label className="label">
                    Status
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
                          {statusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="label">
                    Paid ({invoice.currency})
                    <input
                      name="paid"
                      type="number"
                      min={0}
                      max={Number(invoice.amount)}
                      step="0.01"
                      className="field"
                      defaultValue={Number(invoice.paid)}
                      required
                    />
                  </label>
                  <WorkspaceSubmit secondary>Save payment</WorkspaceSubmit>
                </form>
              ))
            ) : (
              <WorkspaceEmpty
                icon={FileText}
                title="No invoices yet"
                description="Create an invoice below to help this client keep track of payments."
              />
            )}
          </WorkspacePanel>
          <WorkspacePanel
            title="Create an invoice"
            description="New invoices are sent to the client portal immediately"
          >
            <form action={addClientInvoice} className="workspace-form-section">
              {field}
              <div className="workspace-form-grid">
                <label className="label">
                  Invoice number
                  <input
                    className="field"
                    name="number"
                    required
                    placeholder="e.g. RNX-2026-001"
                  />
                </label>
                <label className="label">
                  Invoice title
                  <input
                    className="field"
                    name="title"
                    required
                    placeholder="e.g. Website development deposit"
                  />
                </label>
                <label className="label">
                  Amount (GHS)
                  <input
                    className="field"
                    name="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>
                <label className="label">
                  Due date
                  <input className="field" name="dueDate" type="date" />
                </label>
              </div>
              <div className="mt-5">
                <WorkspaceSubmit>
                  <Plus size={16} />
                  Create invoice
                </WorkspaceSubmit>
              </div>
            </form>
          </WorkspacePanel>
        </div>
      )}
      {view === "support" && (
        <WorkspacePanel
          title="Support requests"
          description="Read the request, follow up with the client and keep its status current"
        >
          {client.supportRequests.length ? (
            client.supportRequests.map((request) => (
              <article className="admin-project-editor" key={request.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <StatusBadge
                        status={request.priority.toUpperCase()}
                        label={`${request.priority} priority`}
                      />
                      <time className="text-xs text-slate-500">
                        {workspaceDate(request.createdAt)}
                      </time>
                    </div>
                    <h3>{request.subject}</h3>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <p className="my-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {request.message}
                </p>
                <form
                  action={updateSupportStatus}
                  className="flex flex-wrap items-end gap-3"
                >
                  {field}
                  <input name="supportId" type="hidden" value={request.id} />
                  <label className="label">
                    Request status
                    <select
                      className="field"
                      name="status"
                      defaultValue={request.status}
                    >
                      {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map(
                        (status) => (
                          <option key={status} value={status}>
                            {statusLabel(status)}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <WorkspaceSubmit secondary>Update status</WorkspaceSubmit>
                  <a
                    className="workspace-text-link"
                    href={`mailto:${client.email}?subject=${encodeURIComponent(`Re: ${request.subject}`)}`}
                  >
                    <Mail size={15} />
                    Follow up by email
                  </a>
                </form>
              </article>
            ))
          ) : (
            <WorkspaceEmpty
              icon={LifeBuoy}
              title="No support requests"
              description="Requests submitted from this client’s portal will appear here."
            />
          )}
        </WorkspacePanel>
      )}
      {view === "updates" && (
        <div className="admin-client-grid">
          <WorkspacePanel
            title="Published updates"
            description="The latest 20 messages shared with this client"
          >
            {timeline}
          </WorkspacePanel>
          <WorkspacePanel
            title="Publish an update"
            description="Keep your client informed"
          >
            <form
              action={addClientUpdate}
              className="workspace-form-section grid gap-4"
            >
              {field}
              <label className="label">
                Project
                <select className="field" name="projectId">
                  <option value="">General account update</option>
                  {client.projects.map((project) => (
                    <option value={project.id} key={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="label">
                Update title
                <input
                  className="field"
                  name="title"
                  required
                  placeholder="What changed?"
                />
              </label>
              <label className="label">
                Message
                <textarea
                  className="field min-h-36"
                  name="message"
                  required
                  placeholder="Share progress, a decision or the next step."
                />
              </label>
              <WorkspaceSubmit pendingLabel="Publishing…">
                Publish to client portal
              </WorkspaceSubmit>
            </form>
          </WorkspacePanel>
        </div>
      )}
    </div>
  );
}
