import "./portal.css";
import { getClientSession } from "@/lib/client-auth";
import { ClientPortalNav } from "@/components/client-portal-nav";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function ClientPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getClientSession();

  return (
    <div className="portal-workspace">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {session ? <ClientPortalNav /> : null}
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
