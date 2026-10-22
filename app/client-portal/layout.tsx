import "../workspace.css";
import "./portal.css";
import { getClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";
import { ClientPortalNav } from "@/components/client-portal-nav";

export const metadata = { robots: { index: false, follow: false } };

export default async function ClientPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getClientSession();
  const client = session
    ? await prisma.client.findUnique({
        where: { id: session.id },
        select: { name: true, company: true },
      })
    : null;
  return (
    <div
      className={`workspace portal-workspace ${client ? "portal-authenticated" : "portal-public"}`}
    >
      <a className="skip-link" href="#client-main">
        Skip to main content
      </a>
      {client && (
        <ClientPortalNav name={client.name} company={client.company} />
      )}
      <div id="client-main" tabIndex={-1} className="portal-content">
        {children}
      </div>
    </div>
  );
}
