import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
  Layers3,
  LifeBuoy,
  Mail,
  Plus,
  ReceiptText,
  Users,
} from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { initials } from "@/lib/workspace";
import { AdminTrendChart } from "@/components/admin-trend-chart";
import {
  WorkspaceEmpty,
  WorkspaceHeading,
  WorkspaceMetric,
  WorkspacePanel,
} from "@/components/workspace/ui";
import {
  getContentOverview,
  getEnquiryTrend,
  getLeadOverview,
  getRecentActivity,
  getRecentMessages,
} from "@/lib/dashboard-data";

export default async function AdminDashboard() {
  const session = await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);
  const manager = session.role !== "EDITOR";
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);
  const content = await getContentOverview();
  const operations = manager
    ? await Promise.all([
        prisma.client.count(),
        prisma.clientProject.count({
          where: { status: { in: ["PLANNING", "IN_PROGRESS", "REVIEW"] } },
        }),
        prisma.supportRequest.count({
          where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
        }),
        getLeadOverview(),
        getRecentMessages(),
        getRecentActivity(),
        getEnquiryTrend(since),
      ])
    : null;
  const leads = operations?.[3];
  const messages = operations?.[4] || [];
  const activity = operations?.[5] || [];
  const now = new Date();
  const trend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleDateString("en-GB", { month: "short" }),
      messages: 0,
      quotes: 0,
      bookings: 0,
    };
  });
  for (const field of ["messages", "quotes", "bookings"] as const) {
    for (const entry of operations?.[6]?.[field] || []) {
      const date = new Date(entry.createdAt);
      const bucket = trend.find(
        (item) => item.key === `${date.getFullYear()}-${date.getMonth()}`,
      );
      if (bucket) bucket[field]++;
    }
  }
  const contentItems = [
    {
      icon: FolderKanban,
      label: "Projects",
      total: content.projects,
      published: content.publishedProjects,
      href: "/admin/projects",
    },
    {
      icon: BriefcaseBusiness,
      label: "Case studies",
      total: content.studies,
      published: content.publishedStudies,
      href: "/admin/case-studies",
    },
    {
      icon: BookOpenText,
      label: "Journal posts",
      total: content.posts,
      published: content.publishedPosts,
      href: "/admin/blog",
    },
    {
      icon: Layers3,
      label: "Services",
      total: content.services,
      published: content.publishedServices,
      href: "/admin/services",
    },
  ];
  return (
    <div>
      <WorkspaceHeading
        eyebrow="Your workspace, at a glance"
        title={`Welcome back, ${session.name.split(" ")[0]}.`}
        description={
          manager
            ? "Keep client work moving and stay on top of the conversations that matter."
            : "Manage your published work and keep the Rennovex website up to date."
        }
        actions={
          <>
            <Link
              href={
                manager
                  ? "/admin/clients#invite-client"
                  : "/admin/projects#project-form"
              }
              className="btn-primary"
            >
              <Plus size={17} />
              {manager ? "Invite a client" : "New project"}
            </Link>
            <Link
              href={manager ? "/admin/messages" : "/admin/projects"}
              className="btn-secondary"
            >
              {manager ? "Open inbox" : "Manage projects"}
              <ArrowRight size={15} />
            </Link>
          </>
        }
      />
      <div className="workspace-metrics">
        {manager ? (
          <>
            <WorkspaceMetric
              icon={Users}
              label="Client accounts"
              value={operations?.[0] || 0}
              detail="Your client relationships"
              href="/admin/clients"
            />
            <WorkspaceMetric
              icon={FolderKanban}
              label="Active client projects"
              value={operations?.[1] || 0}
              detail="Planning, in progress & review"
              href="/admin/clients"
              tone="violet"
            />
            <WorkspaceMetric
              icon={LifeBuoy}
              label="Open support requests"
              value={operations?.[2] || 0}
              detail="Awaiting completion"
              href="/admin/clients?status=support"
              tone="amber"
            />
            <WorkspaceMetric
              icon={Mail}
              label="Unread enquiries"
              value={leads?.unread || 0}
              detail="Messages from your website"
              href="/admin/messages"
              tone="green"
            />
          </>
        ) : (
          contentItems.map((item) => (
            <WorkspaceMetric
              key={item.label}
              icon={item.icon}
              label={item.label}
              value={item.published}
              detail={`${item.total} total · published items shown`}
              href={item.href}
            />
          ))
        )}
      </div>
      <div className={manager ? "admin-overview-columns" : "admin-overview-stack"}>
        <div className="admin-overview-stack">
          {manager && <AdminTrendChart data={trend} />}
          {manager && (
            <WorkspacePanel
              title="Latest enquiries"
              description="New conversations from your website"
              action={
                <Link href="/admin/messages" className="workspace-text-link">
                  View inbox <ArrowRight size={15} />
                </Link>
              }
            >
              {messages.length ? (
                messages.map((message) => (
                  <Link
                    className="workspace-list-row"
                    href="/admin/messages"
                    key={message.id}
                  >
                    <div className="workspace-person">
                      <span className="workspace-avatar">
                        {initials(message.name)}
                      </span>
                      <div className="min-w-0">
                        <strong>{message.name}</strong>
                        <small className="line-clamp-1">
                          {message.projectType || message.message}
                        </small>
                      </div>
                    </div>
                    <time className="shrink-0 text-xs text-slate-500">
                      {formatDate(message.createdAt)}
                    </time>
                  </Link>
                ))
              ) : (
                <WorkspaceEmpty
                  icon={Mail}
                  title="Your inbox is clear"
                  description="Website enquiries will appear here when someone gets in touch."
                />
              )}
            </WorkspacePanel>
          )}
          <WorkspacePanel
            title="Website content"
            description="An overview of what is published"
          >
            {contentItems.map(({ icon: Icon, ...item }) => (
              <Link
                href={item.href}
                key={item.label}
                className="workspace-list-row"
              >
                <div className="workspace-person">
                  <span className="workspace-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>
                      {item.published} published · {item.total} total
                    </small>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="workspace-progress hidden w-24 sm:block">
                    <span
                      style={{
                        width: `${item.total ? (item.published / item.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <ArrowRight size={16} className="text-slate-400" />
                </div>
              </Link>
            ))}
          </WorkspacePanel>
        </div>
        {manager && (
          <div className="admin-overview-stack">
            <WorkspacePanel
              title="Needs your attention"
              description="A useful starting point for today"
            >
              <Link className="workspace-list-row" href="/admin/quotes">
                <div className="workspace-person">
                  <span className="workspace-icon" data-tone="violet">
                    <ReceiptText size={18} />
                  </span>
                  <div>
                    <strong>New quote requests</strong>
                    <small>Review incoming opportunities</small>
                  </div>
                </div>
                <strong className="text-xl tabular-nums">
                  {leads?.quoteRequests || 0}
                </strong>
              </Link>
              <Link className="workspace-list-row" href="/admin/bookings">
                <div className="workspace-person">
                  <span className="workspace-icon" data-tone="amber">
                    <CalendarDays size={18} />
                  </span>
                  <div>
                    <strong>Pending consultations</strong>
                    <small>Review and confirm a time</small>
                  </div>
                </div>
                <strong className="text-xl tabular-nums">
                  {leads?.bookings || 0}
                </strong>
              </Link>
              <div className="p-5">
                <Link className="btn-secondary w-full" href="/admin/clients">
                  Manage client work <ArrowRight size={16} />
                </Link>
              </div>
            </WorkspacePanel>
            <WorkspacePanel
              title="Recent activity"
              description="Updates across the admin workspace"
              action={
                session.role === "SUPER_ADMIN" ? (
                  <Link href="/admin/activity" className="workspace-text-link">
                    View log
                  </Link>
                ) : undefined
              }
            >
              {activity.length ? (
                <div className="workspace-timeline">
                  {activity.slice(0, 5).map((item) => (
                    <article className="workspace-timeline-item" key={item.id}>
                      <h3 className="capitalize">
                        {item.action.toLowerCase().replaceAll("_", " ")}
                      </h3>
                      <time>{formatDate(item.createdAt)}</time>
                      <p>
                        {item.user?.name || "System"} · {item.entity}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <WorkspaceEmpty
                  title="Nothing to report yet"
                  description="Updates made by your team will appear here."
                />
              )}
            </WorkspacePanel>
          </div>
        )}
      </div>
    </div>
  );
}
