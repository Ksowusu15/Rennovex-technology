import type { InvoiceStatus } from "@prisma/client";

/** Parse decimal currency without accepting fractions of a pesewa. */
export function currencyCents(value: string): bigint {
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(value)) {
    throw new Error("Enter an amount with at most two decimal places.");
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
}

export function validateInvoicePayment(
  amount: string,
  paid: string,
  status: InvoiceStatus,
) {
  const total = currencyCents(amount);
  const received = currencyCents(paid);
  if (received > total)
    throw new Error("Paid amount cannot exceed the invoice total.");
  if (status === "PAID" && received !== total) {
    throw new Error(
      "A paid invoice must have its full amount recorded as paid.",
    );
  }
  if (
    status === "PARTIALLY_PAID" &&
    (received === BigInt(0) || received === total)
  ) {
    throw new Error(
      "A partially paid invoice needs a payment below the total.",
    );
  }
  if (
    (status === "DRAFT" || status === "CANCELLED" || status === "SENT") &&
    received > BigInt(0)
  ) {
    throw new Error(
      "Use Partially paid, Paid or Overdue for an invoice with payments.",
    );
  }
  if (status === "OVERDUE" && received === total) {
    throw new Error("A fully paid invoice cannot be overdue.");
  }
  return { status, paid };
}
