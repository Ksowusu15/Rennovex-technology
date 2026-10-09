import { emailSender, sendTransactionalEmail } from "@/lib/email";
import { COMPANY_EMAIL } from "@/lib/company-contact";

type TeamNotification = {
  subject: string;
  replyTo: string;
  fields: readonly (readonly [string, string | null | undefined])[];
  dashboardPath: string;
};

/** Email failures must never undo an already saved client request. */
export async function notifyTeam(input: TeamNotification) {
  try {
    const from = emailSender("contact");
    if (!process.env.RESEND_API_KEY || !from) {
      console.error("Team email notifications need an API key and sender.");
      return;
    }

    const to = process.env.CONTACT_NOTIFICATION_EMAIL || COMPANY_EMAIL;

    const siteUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
    const dashboardUrl = siteUrl
      ? new URL(input.dashboardPath, siteUrl).toString()
      : null;

    await sendTransactionalEmail({
      from,
      to,
      reply_to: input.replyTo,
      subject: input.subject.replace(/[\r\n]/g, " "),
      text: [
        "A new request has been saved in your Rennovex dashboard.",
        "",
        ...input.fields.map(([label, value]) =>
          `${label}: ${value || "Not provided"}`,
        ),
        "",
        dashboardUrl
          ? `Review request: ${dashboardUrl}`
          : "Sign in to the admin dashboard to review the request.",
      ].join("\n"),
    });
  } catch (error) {
    console.error("Team email notification failed; request remains saved:", error);
  }
}
