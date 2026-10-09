export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]!,
  );
}

export function emailSender(kind: "admin" | "client" | "contact") {
  if (kind === "contact")
    return process.env.CONTACT_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (kind === "client")
    return process.env.RESEND_FROM_EMAIL || process.env.ADMIN_FROM_EMAIL;
  return process.env.ADMIN_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
}

export async function sendTransactionalEmail(payload: {
  from: string;
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  reply_to?: string;
}) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is required.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok)
    throw new Error(`Email provider rejected delivery (${response.status}).`);
}
