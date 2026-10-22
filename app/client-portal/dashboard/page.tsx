import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  FolderKanban,
  LifeBuoy,
  MessageSquare,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePortalClient, invoiceTotals } from "@/lib/client-workspace";
import { workspaceDate, workspaceMoney } from "@/lib/workspace";
import {
  StatusBadge,
  WorkspaceEmpty,
  WorkspaceHeading,
  WorkspaceMetric,
  WorkspacePanel,
} from "@/components/workspace/ui";

export const metadata = { title: "Overview | Rennovex Client Portal" };

export default async function ClientDashboardPage() {
  const client = await requirePortalClient();
  const [projects, projectCount, deliverables, support, invoices, updates] =
    await Promise.all([
      prisma.clientProject.findMany({
        where: { clientId: client.id },
        orderBy: { updatedAt: "desc" },
        take: 3,
        include: { milestones: true },
      }),
      prisma.clientProject.count({
        where: { clientId: client.id, status: { not: "COMPLETED" } },
      }),
      prisma.clientFile.count({ where: { project: { clientId: client.id } } }),
      prisma.supportRequest.findMany({
        where: { clientId: client.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.clientInvoice.findMany({
        where: {
          clientId: client.id,
          status: { notIn: ["DRAFT", "CANCELLED"] },
        },
        select: {
          amount: true,
          paid: true,
          status: true,
          currency: true,
          title: true,
          dueDate: true,
        },
      }),
      prisma.clientUpdate.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { project: { select: { name: true } } },
      }),
    ]);
  const totals = invoiceTotals(invoices);
  const outstanding =
    totals
      .filter((item) => item.outstanding > 0)
      .map((item) => workspaceMoney(item.outstanding, item.currency))
      .join(" · ") || workspaceMoney(0);
  const nextInvoice = invoices
    .filter((item) => item.dueDate && Number(item.amount) > Number(item.paid))
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0];
  return (
    <main className="portal-shell">
      <WorkspaceHeading
        eyebrow="Your client workspace"
        title={`Welcome back, ${client.name.split(" ")[0]}.`}
        description="Your projects, shared files and conversations, together in one place."
        actions={
          <Link href="/client-portal/support" className="btn-primary">
            <LifeBuoy size={17} />
            Get in touch
          </Link>
        }
      />
      <div className="workspace-metrics">
        <WorkspaceMetric
          icon={FolderKanban}
          label="Ongoing projects"
          value={projectCount}
          detail="Work we’re delivering together"
          href="/client-portal/projects"
        />
        <WorkspaceMetric
          icon={FileText}
          label="Shared deliverables"
          value={deliverables}
          detail="Files ready for you to access"
          href="/client-portal/projects"
          tone="violet"
        />
        <WorkspaceMetric
          icon={CircleDollarSign}
          label="Outstanding balance"
          value={<span className="portal-metric-money">{outstanding}</span>}
          detail="Across your issued invoices"
          href="/client-portal/invoices"
          tone="amber"
        />
        <WorkspaceMetric
          icon={MessageSquare}
          label="Open support"
          value={support.length}
          detail="Requests we’re working on"
          href="/client-portal/support"
          tone="green"
        />
      </div>
      <div className="portal-columns">
        <div className="portal-stack">
          <WorkspacePanel
            title="Your projects"
            description="The latest progress on your work"
            action={
              <Link
                href="/client-portal/projects"
                className="workspace-text-link"
              >
                All projects
                <ArrowRight size={15} />
              </Link>
            }
          >
            {projects.length ? (
              projects.map((project) => (
                <article className="portal-project-card" key={project.id}>
                  <div className="portal-project-card-heading">
                    <div>
                      <Link
                        href="/client-portal/projects"
                        className="hover:text-blue-700"
                      >
                        <h3>{project.name}</h3>
                      </Link>
                      <p className="mt-2 line-clamp-2">
                        {project.description ||
                          "Your project progress and milestones are tracked here."}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </div>
                  <div className="mt-5">
                    <div className="portal-project-progress-label">
                      <span>Overall progress</span>
                      <strong>{project.progress}%</strong>
                    </div>
                    <div
                      className="workspace-progress"
                      role="progressbar"
                      aria-label={`${project.name} progress`}
                      aria-valuenow={project.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      {
                        project.milestones.filter((item) => item.completed)
                          .length
                      }{" "}
                      of {project.milestones.length} milestones complete
                    </span>
                    {project.dueDate && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        Target {workspaceDate(project.dueDate)}
                      </span>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <WorkspaceEmpty
                icon={FolderKanban}
                title="Your next project starts here"
                description="Once Rennovex assigns your project, you’ll see its progress, milestones and files here."
                action={
                  <Link href="/client-portal/support" className="btn-secondary">
                    Discuss a project
                    <ArrowRight size={15} />
                  </Link>
                }
              />
            )}
          </WorkspacePanel>
          <WorkspacePanel
            title="Latest updates"
            description="A direct line to what’s happening with your work"
          >
            {updates.length ? (
              <div className="workspace-timeline">
                {updates.map((update) => (
                  <article className="workspace-timeline-item" key={update.id}>
                    <h3>{update.title}</h3>
                    <time dateTime={update.createdAt.toISOString()}>
                      {workspaceDate(update.createdAt)}
                      {update.project
                        ? ` · ${update.project.name}`
                        : " · Rennovex team"}
                    </time>
                    <p>{update.message}</p>
                  </article>
                ))}
              </div>
            ) : (
              <WorkspaceEmpty
                icon={MessageSquare}
                title="You’re up to date"
                description="Progress notes and messages from the team will appear here."
              />
            )}
          </WorkspacePanel>
        </div>
        <div className="portal-stack">
          <WorkspacePanel
            title="Billing snapshot"
            description="A clear view of your next payment"
          >
            <div className="p-6">
              <p className="text-xs text-slate-500">Outstanding balance</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                {outstanding}
              </p>
              {nextInvoice ? (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold">{nextInvoice.title}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Due {workspaceDate(nextInvoice.dueDate)}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-xs leading-6 text-slate-500">
                  {invoices.length
                    ? "No upcoming unpaid invoice with a due date."
                    : "Your invoices will appear once they are issued."}
                </p>
              )}
              <Link
                href="/client-portal/invoices"
                className="btn-secondary mt-5 w-full"
              >
                View invoices
                <ArrowRight size={15} />
              </Link>
            </div>
          </WorkspacePanel>
          <WorkspacePanel
            title="Support requests"
            action={
              <Link
                href="/client-portal/support"
                className="workspace-text-link"
              >
                View all
              </Link>
            }
          >
            {support.length ? (
              support.slice(0, 3).map((request) => (
                <div className="workspace-list-row" key={request.id}>
                  <div>
                    <p className="text-xs font-semibold">{request.subject}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {workspaceDate(request.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
              ))
            ) : (
              <div className="p-6">
                <span className="workspace-icon" data-tone="green">
                  <CheckCircle2 size={20} />
                </span>
                <h3 className="mt-4 text-sm font-semibold">No open requests</h3>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Everything is clear. We’re here whenever you need a hand.
                </p>
              </div>
            )}
          </WorkspacePanel>
          <div className="workspace-callout">
            <p className="font-semibold">Working better, together.</p>
            <p className="mt-1 text-xs">
              Have feedback or a question? Your support workspace is the best
              place to reach the team.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
