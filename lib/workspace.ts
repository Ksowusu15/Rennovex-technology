export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0] || "")
      .join("")
      .toUpperCase() || "R"
  );
}

export function workspaceDate(
  value: Date | string | null,
  options?: Intl.DateTimeFormatOptions,
) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    ...options,
  });
}

export function workspaceMoney(value: number | string, currency = "GHS") {
  return new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function statusLabel(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function statusTone(status: string) {
  if (["PAID", "COMPLETED", "RESOLVED", "ACTIVE", "SENT"].includes(status))
    return "success";
  if (["OVERDUE", "HIGH", "FAILED"].includes(status)) return "danger";
  if (
    ["ON_HOLD", "PARTIALLY_PAID", "PENDING", "INVITED", "REVIEW"].includes(
      status,
    )
  )
    return "warning";
  if (["IN_PROGRESS", "OPEN", "PLANNING"].includes(status)) return "info";
  return "neutral";
}

export function pageNumber(value: string | undefined) {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? Math.min(page, 100000) : 1;
}
