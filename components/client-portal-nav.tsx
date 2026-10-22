"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  ChevronRight,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  UserRound,
} from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { initials } from "@/lib/workspace";

const portalLinks = [
  {
    href: "/client-portal/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  { href: "/client-portal/projects", label: "My projects", icon: FolderKanban },
  { href: "/client-portal/invoices", label: "Invoices", icon: FileText },
  { href: "/client-portal/support", label: "Support", icon: LifeBuoy },
  { href: "/client-portal/profile", label: "My account", icon: UserRound },
];

export function ClientPortalNav({
  name,
  company,
}: {
  name: string;
  company?: string | null;
}) {
  const pathname = usePathname();
  const navigation = (
    <nav className="portal-navigation" aria-label="Client workspace">
      {portalLinks.map(({ href, label, icon: Icon }) => (
        <Link
          href={href}
          key={href}
          aria-current={pathname.startsWith(href) ? "page" : undefined}
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </Link>
      ))}
    </nav>
  );
  return (
    <>
      <aside className="portal-sidebar">
        <Link
          href="/client-portal/dashboard"
          className="portal-sidebar-brand"
          aria-label="Rennovex client workspace"
        >
          <SiteLogo compact />
          <span>
            Rennovex<strong>Client workspace</strong>
          </span>
        </Link>
        <div className="portal-organisation">
          <span className="workspace-avatar">{initials(company || name)}</span>
          <div>
            <strong>{company || name}</strong>
            <p>Your workspace</p>
          </div>
        </div>
        <p className="portal-sidebar-label">Workspace</p>
        {navigation}
        <div className="portal-sidebar-help">
          <LifeBuoy size={22} />
          <h2>We’re here to help.</h2>
          <p>Questions about a project or payment? Start a conversation.</p>
          <Link href="/client-portal/support">
            Contact the team
            <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="portal-sidebar-bottom">
          <Link href="/" className="portal-sidebar-website">
            Return to website
            <ArrowUpRight size={15} />
          </Link>
          <form action="/api/client-auth/logout" method="post">
            <button className="portal-sidebar-signout" type="submit">
              <LogOut size={16} />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <header className="portal-topbar">
        <div className="portal-topbar-breadcrumb">
          <span>Client workspace</span>
          <ChevronRight size={14} />
          <strong>
            {portalLinks.find((link) => pathname.startsWith(link.href))
              ?.label || "Overview"}
          </strong>
        </div>
        <div className="portal-topbar-account">
          <Link
            href="/"
            className="portal-mobile-home"
            aria-label="Return to website"
          >
            <ArrowUpRight size={18} />
          </Link>
          <span className="workspace-avatar">{initials(name)}</span>
          <div>
            <strong>{name}</strong>
            <p>{company || "Rennovex client"}</p>
          </div>
          <form action="/api/client-auth/logout" method="post">
            <button
              className="portal-mobile-signout"
              type="submit"
              aria-label="Sign out"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </header>
      <div className="portal-mobile-nav">{navigation}</div>
    </>
  );
}
