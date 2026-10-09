import { safeFileUrl } from "@/lib/safe-url";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CircleDollarSign,
  FileText,
  FolderKanban,
  LifeBuoy,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getClientSession } from "@/lib/client-auth";

export const metadata = {
  title: "Client Dashboard | Rennovex Technology",
};

export default async function ClientDashboardPage() {
  const session = await getClientSession();
  if (!session) redirect("/client-portal");

  const client = await prisma.client.findUnique({
    where: { id: session.id },
    include: {
      projects: {
        orderBy: { updatedAt: "desc" },
        include: {
          milestones: { orderBy: { order: "asc" } },
          files: { orderBy: { createdAt: "desc" } },
        },
      },
      invoices: { orderBy: { createdAt: "desc" } },
      _count: {
        select: {
          supportRequests: {
            where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
          },
        },
      },
      supportRequests: { orderBy: { createdAt: "desc" }, take: 5 },
      updates: { orderBy: { createdAt: "desc" }, take: 6 },
    },
  });

  if (!client || !client.isActive) redirect("/client-portal");

  const balances = new Map<string, number>();

  for (const invoice of client.invoices) {
    if (invoice.status === "DRAFT" || invoice.status === "CANCELLED") {
      continue;
    }

    const balance = Math.max(0, Number(invoice.amount) - Number(invoice.paid));
    balances.set(invoice.currency, (balances.get(invoice.currency) ?? 0) + balance);
  }

  const outstanding =
    Array.from(balances)
      .filter(([, amount]) => amount > 0)
      .map(([currency, amount]) => money(amount, currency))
      .join(" · ") || money(0, "GHS");

  return (
    <main className="portal-shell portal-main">
      <div className="portal-intro">
        <div>
          <p className="text-sm font-semibold text-blue-600">Client workspace</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Welcome, {client.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review your projects, deliverables, payments and the latest updates from
            Rennovex.
          </p>
        </div>
        <Link className="btn-primary shrink-0" href="/client-portal/support">
          <LifeBuoy size={18} aria-hidden="true" />
          Request support
        </Link>
      </div>

      <div>
        <div className="portal-metrics">
          <Metric
            icon={FolderKanban}
            label="Projects"
            value={client.projects.length}
          />
          <Metric
            icon={FileText}
            label="Deliverables"
            value={client.projects.reduce(
              (total, project) => total + project.files.length,
              0,
            )}
          />
          <Metric icon={CircleDollarSign} label="Outstanding" value={outstanding} />
          <Metric
            icon={LifeBuoy}
            label="Open support"
            value={client._count.supportRequests}
          />
        </div>

        <section className="portal-columns">
          <div className="portal-stack">
            <div className="portal-panel">
              <h2 className="text-xl font-bold text-slate-950">My projects</h2>
              <div className="mt-5 space-y-4">
                {client.projects.length === 0 && (
                  <Empty text="No client projects have been assigned yet." />
                )}
                {client.projects.map((project) => (
                  <article key={project.id} className="portal-project">
                    <div className="portal-project-heading">
                      <div>
                        <h3 className="font-bold text-slate-950">{project.name}</h3>
                        <p className="portal-metric-label">
                          {project.description ?? "Rennovex client project"}
                        </p>
                      </div>
                      <span className="portal-status" data-status={project.status}>
                        {project.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    {project.dueDate && (
                      <p className="mt-3 text-xs font-semibold text-slate-500">
                        Target completion: {date(project.dueDate)}
                      </p>
                    )}
                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs font-semibold text-slate-600">
                        <span>Project progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div
                        className="h-2 overflow-hidden rounded-full bg-slate-100"
                        role="progressbar"
                        aria-label={`${project.name} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.max(0, Math.min(100, project.progress))}
                      >
                        <div
                          className="h-full rounded-full bg-blue-600"
                          style={{
                            width: `${Math.max(0, Math.min(100, project.progress))}%`,
                          }}
                        />
                      </div>
                    </div>
                    {project.milestones.length > 0 && (
                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        {project.milestones.map((milestone) => (
                          <div
                            key={milestone.id}
                            className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700"
                          >
                            {milestone.completed ? "✓" : "○"} {milestone.title}
                          </div>
                        ))}
                      </div>
                    )}
                    {project.files.length > 0 && (
                      <div className="portal-files">
                        {project.files.map((file) => {
                          const href = safeFileUrl(file.url);
                          if (!href)
                            return (
                              <p
                                key={file.id}
                                className="portal-file text-slate-500"
                              >
                                {file.name} · Link unavailable. Please contact
                                support.
                              </p>
                            );
                          return (
                            <Link
                              key={file.id}
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="portal-file"
                              aria-label={`${file.name} (opens in a new tab)`}
                            >
                              <FileText size={16} aria-hidden="true" />
                              <span className="min-w-0 flex-1">{file.name}</span>
                              <ArrowUpRight size={16} aria-hidden="true" />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="portal-panel">
              <h2 className="text-xl font-bold text-slate-950">
                Invoices & payments
              </h2>
              <div className="mt-5 space-y-3">
                {client.invoices.length === 0 && <Empty text="No invoices yet." />}
                {client.invoices.map((invoice) => (
                  <div key={invoice.id} className="portal-invoice">
                    <div>
                      <p className="font-semibold text-slate-900">{invoice.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{invoice.number}</p>
                      {invoice.dueDate && (
                        <p className="mt-1 text-xs text-slate-500">
                          Due {date(invoice.dueDate)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-950">
                        {money(Number(invoice.amount), invoice.currency)}
                      </p>
                      <p className="portal-status mt-1" data-status={invoice.status}>
                        {invoice.status.replaceAll("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="portal-stack">
            <div className="portal-panel">
              <h2>Recent support requests</h2>
              <div className="mt-4 space-y-4">
                {client.supportRequests.length === 0 && (
                  <Empty text="No support requests yet. Contact us whenever you need help." />
                )}
                {client.supportRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <p className="text-sm font-semibold">{request.subject}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {date(request.createdAt)}
                    </p>
                    <span
                      className="portal-status mt-2"
                      data-status={request.status}
                    >
                      {request.status.replaceAll("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="portal-panel">
              <h2 className="font-bold text-slate-950">Latest updates</h2>
              <div className="mt-4 space-y-4">
                {client.updates.length === 0 && <Empty text="No updates yet." />}
                {client.updates.map((update) => (
                  <div key={update.id} className="border-l-2 border-blue-200 pl-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {update.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {date(update.createdAt)}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {update.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="portal-panel">
              <h2 className="font-bold text-slate-950">Need help?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Send a support request and the Rennovex team will follow up.
              </p>
              <Link
                className="btn-primary mt-5 w-full"
                href="/client-portal/support"
              >
                <LifeBuoy size={17} />
                Contact support
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FolderKanban;
  label: string;
  value: string | number;
}) {
  return (
    <div className="portal-metric">
      <Icon className="text-blue-600" size={20} />
      <p className="portal-metric-value">{value}</p>
      <p className="portal-metric-label">{label}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="portal-empty">{text}</p>;
}

function money(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function date(value: Date) {
  return value.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}
