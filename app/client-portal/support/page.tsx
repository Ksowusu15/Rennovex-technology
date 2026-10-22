import Link from "next/link";
import { LifeBuoy, Mail, MessageSquare } from "lucide-react";
import { ClientSupportForm } from "@/components/client-support-form";
import { requirePortalClient } from "@/lib/client-workspace";
import { prisma } from "@/lib/prisma";
import { pageNumber, workspaceDate } from "@/lib/workspace";
import {
  StatusBadge,
  WorkspaceEmpty,
  WorkspaceHeading,
  WorkspacePanel,
} from "@/components/workspace/ui";

export const metadata = { title: "Support | Rennovex Client Portal" };
export default async function ClientSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const client = await requirePortalClient();
  const params = await searchParams;
  const count = await prisma.supportRequest.count({
    where: { clientId: client.id },
  });
  const pages = Math.max(1, Math.ceil(count / 8));
  const page = Math.min(pageNumber(params.page), pages);
  const requests = await prisma.supportRequest.findMany({
    where: { clientId: client.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 8,
    skip: (page - 1) * 8,
  });
  return (
    <main className="portal-shell">
      <WorkspaceHeading
        eyebrow="A conversation starts here"
        title="How can we help?"
        description="Tell us what you need. You can follow the status of every request in this workspace."
      />
      <div className="portal-form-layout">
        <WorkspacePanel
          title="Send a support request"
          description="Share a question, report an issue or discuss a next step"
        >
          <ClientSupportForm />
        </WorkspacePanel>
        <div className="portal-stack">
          <div className="workspace-callout">
            <div className="flex items-center gap-2 font-semibold">
              <LifeBuoy size={18} />A little detail goes a long way.
            </div>
            <p className="mt-2 text-xs leading-6">
              Include a project name or invoice number where relevant. Please
              don’t include passwords, payment-card details or other sensitive
              information.
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs">
              <Mail size={14} />
              The team will follow up using your account email.
            </p>
          </div>
          <WorkspacePanel
            title="Your requests"
            description={`${count} ${count === 1 ? "conversation" : "conversations"} with the Rennovex team`}
          >
            {requests.length ? (
              requests.map((request) => (
                <details key={request.id} className="portal-support-item">
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3>{request.subject}</h3>
                        <p className="!mt-0 text-[11px]">
                          {workspaceDate(request.createdAt)} ·{" "}
                          {request.priority} priority
                        </p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <span className="workspace-text-link mt-1 text-xs">
                      View request details
                    </span>
                  </summary>
                  <p>{request.message}</p>
                  <p className="text-xs">
                    Last updated {workspaceDate(request.updatedAt)}
                  </p>
                </details>
              ))
            ) : (
              <WorkspaceEmpty
                icon={MessageSquare}
                title="No requests yet"
                description="Any support requests you submit will appear here, along with their current status."
              />
            )}
            {pages > 1 && (
              <div className="workspace-pagination">
                <span>
                  Page {page} of {pages}
                </span>
                <nav aria-label="Support request pages">
                  {page > 1 && (
                    <Link
                      className="btn-secondary"
                      href={`/client-portal/support?page=${page - 1}`}
                    >
                      Previous
                    </Link>
                  )}
                  {page < pages && (
                    <Link
                      className="btn-secondary"
                      href={`/client-portal/support?page=${page + 1}`}
                    >
                      Next
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </WorkspacePanel>
        </div>
      </div>
    </main>
  );
}
