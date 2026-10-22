import { AdminShell } from "@/components/admin-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const liveSession = session
    ? { name: session.name, email: session.email, role: session.role }
    : null;
  const notifications =
    liveSession && liveSession.role !== "EDITOR"
      ? await Promise.all([
          prisma.message.count({ where: { status: "UNREAD" } }),
          prisma.quoteRequest.count({ where: { status: "NEW" } }),
          prisma.consultationBooking.count({ where: { status: "PENDING" } }),
          prisma.chatSession.count({ where: { status: "NEEDS_REPLY" } }),
          prisma.supportRequest.count({
            where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
          }),
          prisma.notificationJob.count({
            where: { status: { not: "SENT" }, attempts: { gt: 0 } },
          }),
        ])
          .then(
            ([
              unreadMessages,
              newQuotes,
              pendingBookings,
              assistantReplies,
              clientSupport,
              failedEmails,
            ]) => ({
              unreadMessages,
              newQuotes,
              pendingBookings,
              assistantReplies,
              clientSupport,
              failedEmails,
            }),
          )
          .catch(() => ({
            unreadMessages: 0,
            newQuotes: 0,
            pendingBookings: 0,
            assistantReplies: 0,
            clientSupport: 0,
            failedEmails: 0,
            unavailable: true,
          }))
      : {
          unreadMessages: 0,
          newQuotes: 0,
          pendingBookings: 0,
          assistantReplies: 0,
          clientSupport: 0,
          failedEmails: 0,
        };
  return (
    <AdminShell session={liveSession} notifications={notifications}>
      {children}
    </AdminShell>
  );
}
