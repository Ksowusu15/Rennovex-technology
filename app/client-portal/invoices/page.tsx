import Link from "next/link";
import {
  ArrowRight,
  CircleDollarSign,
  FileText,
  LifeBuoy,
  ReceiptText,
} from "lucide-react";
import { requirePortalClient, invoiceTotals } from "@/lib/client-workspace";
import { prisma } from "@/lib/prisma";
import { pageNumber, workspaceDate, workspaceMoney } from "@/lib/workspace";
import {
  StatusBadge,
  WorkspaceEmpty,
  WorkspaceHeading,
  WorkspaceMetric,
  WorkspacePanel,
} from "@/components/workspace/ui";

export const metadata = { title: "Invoices | Rennovex Client Portal" };
export default async function ClientInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const client = await requirePortalClient();
  const params = await searchParams;
  const where = { clientId: client.id, status: { not: "DRAFT" as const } };
  const summary = await prisma.clientInvoice.findMany({
    where,
    select: { amount: true, paid: true, status: true, currency: true },
  });
  const totals = invoiceTotals(summary);
  const pages = Math.max(1, Math.ceil(summary.length / 10));
  const page = Math.min(pageNumber(params.page), pages);
  const invoices = await prisma.clientInvoice.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * 10,
    take: 10,
  });
  const display = (field: "outstanding" | "paid") =>
    totals
      .filter((item) => item[field] > 0)
      .map((item) => workspaceMoney(item[field], item.currency))
      .join(" · ") || workspaceMoney(0);
  return (
    <main className="portal-shell">
      <WorkspaceHeading
        eyebrow="Clear, considered billing"
        title="Invoices & payments"
        description="Review what has been issued, what you have paid and what remains outstanding."
        actions={
          <Link href="/client-portal/support" className="btn-secondary">
            <LifeBuoy size={16} />
            Ask a billing question
          </Link>
        }
      />
      <div className="workspace-metrics portal-billing-metrics">
        <WorkspaceMetric
          icon={CircleDollarSign}
          label="Outstanding balance"
          value={<span className="text-[22px]">{display("outstanding")}</span>}
          detail="Excludes cancelled invoices"
          tone="amber"
        />
        <WorkspaceMetric
          icon={ReceiptText}
          label="Payments recorded"
          value={<span className="text-[22px]">{display("paid")}</span>}
          detail="As recorded by the Rennovex team"
          tone="green"
        />
        <WorkspaceMetric
          icon={FileText}
          label="Issued invoices"
          value={summary.length}
          detail="All invoices visible to you"
        />
      </div>
      <WorkspacePanel
        title="Invoice history"
        description="Payment records for your account"
      >
        {invoices.length ? (
          <div className="workspace-table-wrap">
            <table className="workspace-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Due date</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="min-w-[190px]">
                      <strong className="block font-semibold">
                        {invoice.title}
                      </strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        {invoice.number}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-xs text-slate-500">
                      {invoice.dueDate
                        ? workspaceDate(invoice.dueDate)
                        : "Not set"}
                    </td>
                    <td className="whitespace-nowrap font-semibold tabular-nums">
                      {workspaceMoney(
                        invoice.amount.toString(),
                        invoice.currency,
                      )}
                    </td>
                    <td className="whitespace-nowrap text-slate-500 tabular-nums">
                      {workspaceMoney(
                        invoice.paid.toString(),
                        invoice.currency,
                      )}
                    </td>
                    <td className="whitespace-nowrap font-semibold tabular-nums">
                      {invoice.status === "CANCELLED"
                        ? "—"
                        : workspaceMoney(
                            Math.max(
                              0,
                              Number(invoice.amount) - Number(invoice.paid),
                            ),
                            invoice.currency,
                          )}
                    </td>
                    <td>
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <WorkspaceEmpty
            icon={FileText}
            title="No invoices yet"
            description="When an invoice is issued for your project, the details and payment status will appear here."
          />
        )}
        {pages > 1 && (
          <div className="workspace-pagination">
            <span>
              Page {page} of {pages}
            </span>
            <nav aria-label="Invoice pages">
              {page > 1 && (
                <Link
                  href={`/client-portal/invoices?page=${page - 1}`}
                  className="btn-secondary"
                >
                  Previous
                </Link>
              )}
              {page < pages && (
                <Link
                  href={`/client-portal/invoices?page=${page + 1}`}
                  className="btn-secondary"
                >
                  Next
                </Link>
              )}
            </nav>
          </div>
        )}
      </WorkspacePanel>
      <div className="workspace-callout mt-6">
        <strong>Need a copy or have a payment question?</strong>
        <p className="mt-1">
          Include the invoice number in a support request so the team can help
          you quickly.
        </p>
        <Link
          className="workspace-text-link mt-1"
          href="/client-portal/support"
        >
          Contact support
          <ArrowRight size={15} />
        </Link>
      </div>
    </main>
  );
}
