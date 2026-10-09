"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  UserRound,
} from "lucide-react";
import { SiteLogo } from "@/components/site-logo";

const portalLinks = [
  {
    href: "/client-portal/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/client-portal/support",
    label: "Support",
    icon: LifeBuoy,
  },
  {
    href: "/client-portal/profile",
    label: "Profile",
    icon: UserRound,
  },
];

export function ClientPortalNav() {
  const pathname = usePathname();

  return (
    <header className="portal-header">
      <div className="portal-shell portal-header-row">
        <Link
          href="/client-portal/dashboard"
          aria-label="Rennovex client dashboard"
          className="portal-brand"
        >
          <SiteLogo compact />
          <span>
            <strong>Client Portal</strong>
            <small>Rennovex Technology</small>
          </span>
        </Link>
        <div className="portal-header-actions">
          <Link href="/" className="portal-website">
            <ExternalLink size={16} aria-hidden="true" />
            <span>Return to website</span>
          </Link>
          <form action="/api/client-auth/logout" method="post">
            <button type="submit" className="portal-signout">
              <LogOut size={16} aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </form>
        </div>
      </div>
      <nav className="portal-shell portal-tabs" aria-label="Client portal">
        {portalLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={active ? "portal-tab is-active" : "portal-tab"}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
