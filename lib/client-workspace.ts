import { cache } from "react";
import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";

export const requirePortalClient = cache(async () => {
  const session = await getClientSession();
  if (!session) redirect("/client-portal");
  const client = await prisma.client.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      company: true,
      phone: true,
      isActive: true,
      createdAt: true,
    },
  });
  if (!client?.isActive) redirect("/client-portal");
  return client;
});

export function invoiceTotals(
  invoices: {
    currency: string;
    amount: { toString(): string };
    paid: { toString(): string };
    status: string;
  }[],
) {
  const balances = new Map<string, { outstanding: number; paid: number }>();
  for (const invoice of invoices) {
    if (["DRAFT", "CANCELLED"].includes(invoice.status)) continue;
    const balance = balances.get(invoice.currency) || {
      outstanding: 0,
      paid: 0,
    };
    const amount = Math.round(Number(invoice.amount.toString()) * 100);
    const paid = Math.round(Number(invoice.paid.toString()) * 100);
    balance.outstanding += Math.max(0, amount - paid);
    balance.paid += paid;
    balances.set(invoice.currency, balance);
  }
  return Array.from(balances, ([currency, balance]) => ({
    currency,
    outstanding: balance.outstanding / 100,
    paid: balance.paid / 100,
  }));
}
