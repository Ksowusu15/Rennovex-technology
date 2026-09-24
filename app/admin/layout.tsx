import { AdminShell } from "@/components/admin-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const liveSession = session ? { name: session.name, 
    email: session.email, 
    role: session.role } : null;
  const notifications = liveSession 
    && liveSession.role !== "EDITOR"
    ? await Promise.all([
        prisma.message.count({ where: { status: "UNREAD" } }),
        prisma.quoteRequest.count({ where: { status: "NEW" } }),
        prisma.consultationBooking.count({ where: { status: "PENDING" } }),
        prisma.chatSession.count({ where: { status: "NEEDS_REPLY" } }),
      ]).then(([unreadMessages, newQuotes, pendingBookings, assistantReplies]) => ({ unreadMessages, 
        newQuotes, 
        pendingBookings, 
        assistantReplies })).catch(() => ({ unreadMessages: 0, 
        newQuotes: 0, 
        pendingBookings: 0, 
        assistantReplies: 0 }))
    : { unreadMessages: 0, 
      newQuotes: 0, 
      pendingBookings: 0, 
      assistantReplies: 0 };
  return <AdminShell 
    session={liveSession} 
    notifications={notifications}>
    {children}
  </AdminShell>;
}
