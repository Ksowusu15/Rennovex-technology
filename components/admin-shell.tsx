"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  FolderKanban,
  Layers3,
  LayoutDashboard,
  Mail,
  Menu,
  MessageCircleMore,
  MonitorSmartphone,
  ReceiptText,
  ScrollText,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  X,
  Send,
} from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { AdminProfileMenu } from "@/components/admin-profile-menu";
import { AdminNotifications } from "@/components/admin-notifications";
import { LogoutButton } from "@/components/logout-button";
import { initials } from "@/lib/workspace";

type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR";
type Session = { name: string; email: string; role: Role };
type Summary = {
  unreadMessages: number;
  newQuotes: number;
  pendingBookings: number;
  assistantReplies: number;
  clientSupport: number;
  failedEmails: number;
  unavailable?: boolean;
};
type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  roles?: Role[];
  count?: keyof Omit<Summary, "unavailable">;
};
const managers: Role[] = ["SUPER_ADMIN", "ADMIN"];
const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      {
        label: "Clients",
        href: "/admin/clients",
        icon: Users,
        roles: managers,
        count: "clientSupport",
      },
      {
        label: "Inbox",
        href: "/admin/messages",
        icon: Mail,
        roles: managers,
        count: "unreadMessages",
      },
      {
        label: "Quote requests",
        href: "/admin/quotes",
        icon: ReceiptText,
        roles: managers,
        count: "newQuotes",
      },
      {
        label: "Consultations",
        href: "/admin/bookings",
        icon: CalendarDays,
        roles: managers,
        count: "pendingBookings",
      },
      {
        label: "Assistant",
        href: "/admin/assistant",
        icon: MessageCircleMore,
        roles: managers,
        count: "assistantReplies",
      },
    ],
  },
  {
    label: "Website",
    items: [
      { label: "Projects", href: "/admin/projects", icon: FolderKanban },
      {
        label: "Case studies",
        href: "/admin/case-studies",
        icon: BriefcaseBusiness,
      },
      { label: "Journal", href: "/admin/blog", icon: BookOpenText },
      { label: "Services", href: "/admin/services", icon: Layers3 },
      {
        label: "Testimonials",
        href: "/admin/testimonials",
        icon: MessageCircleMore,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        label: "Email delivery",
        href: "/admin/notifications",
        icon: Send,
        roles: managers,
        count: "failedEmails",
      },
      {
        label: "Site settings",
        href: "/admin/settings",
        icon: Settings2,
        roles: managers,
      },
      {
        label: "Team & roles",
        href: "/admin/users",
        icon: ShieldCheck,
        roles: ["SUPER_ADMIN"],
      },
      {
        label: "Activity log",
        href: "/admin/activity",
        icon: ScrollText,
        roles: ["SUPER_ADMIN"],
      },
      { label: "My profile", href: "/admin/profile", icon: UserRound },
      {
        label: "Active sessions",
        href: "/admin/profile/sessions",
        icon: MonitorSmartphone,
      },
    ],
  },
];
const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super administrator",
  ADMIN: "Administrator",
  EDITOR: "Content editor",
};

function Navigation({
  session,
  notifications,
  onNavigate,
}: {
  session: Session | null;
  notifications: Summary;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const activeHref = groups
    .flatMap((group) => group.items)
    .filter((item) =>
      item.href === "/admin"
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav aria-label="Admin navigation" className="admin-navigation">
      {groups.map((group) => {
        const items = group.items.filter(
          (item) =>
            session && (!item.roles || item.roles.includes(session.role)),
        );
        if (!items.length) return null;
        return (
          <div className="admin-nav-group" key={group.label}>
            <p>{group.label}</p>
            {items.map(({ icon: Icon, label, href, count }) => (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={activeHref === href ? "page" : undefined}
                className="admin-nav-link"
              >
                <Icon size={18} aria-hidden="true" />
                <span>{label}</span>
                {count &&
                  !notifications.unavailable &&
                  notifications[count] > 0 && (
                    <small>
                      {notifications[count] > 99 ? "99+" : notifications[count]}
                    </small>
                  )}
              </Link>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  session,
  notifications,
}: {
  children: React.ReactNode;
  session: Session | null;
  notifications: Summary;
}) {
  const pathname = usePathname();
  const drawer = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    drawer.current?.close();
  }, [pathname]);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const close = () => {
      if (media.matches) drawer.current?.close();
    };
    media.addEventListener("change", close);
    return () => media.removeEventListener("change", close);
  }, []);
  if (
    ["/admin/login", "/admin/forgot-password", "/admin/reset-password"].some(
      (route) => pathname.startsWith(route),
    )
  )
    return <>{children}</>;
  const current = groups
    .flatMap((group) => group.items)
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0];
  const brand = (
    <Link
      href="/admin"
      className="admin-brand"
      aria-label="Rennovex administration"
    >
      <SiteLogo compact />
      <span>
        Rennovex<strong>Administration</strong>
      </span>
    </Link>
  );
  const sidebar = (
    <>
      <div className="admin-sidebar-brand">{brand}</div>
      <div className="admin-sidebar-navigation">
        <Navigation
          session={session}
          notifications={notifications}
          onNavigate={() => drawer.current?.close()}
        />
      </div>
      <div className="admin-sidebar-account">
        <span className="workspace-avatar">
          {initials(session?.name || "Rennovex")}
        </span>
        <div>
          <strong>{session?.name || "Rennovex"}</strong>
          <p>{session ? roleLabels[session.role] : "Administration"}</p>
        </div>
      </div>
      <div className="admin-sidebar-logout">
        <LogoutButton compact onBeforeLogout={() => drawer.current?.close()} />
      </div>
    </>
  );
  return (
    <div className="workspace admin-workspace">
      <a className="skip-link" href="#admin-main">
        Skip to main content
      </a>
      <aside className="admin-sidebar">{sidebar}</aside>
      <div className="admin-canvas">
        <header className="admin-topbar">
          <div className="admin-topbar-location">
            <button
              ref={trigger}
              type="button"
              className="admin-menu-trigger"
              onClick={() => drawer.current?.showModal()}
              aria-label="Open admin navigation"
            >
              <Menu size={20} />
            </button>
            <span className="admin-breadcrumb-root">Workspace</span>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{current?.label || "Overview"}</span>
          </div>
          <div className="admin-topbar-actions">
            {session && session.role !== "EDITOR" && (
              <AdminNotifications summary={notifications} />
            )}
            <Link
              href="/"
              className="admin-website-link"
              aria-label="Return to website"
            >
              <span>View website</span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
            {session && <AdminProfileMenu session={session} />}
          </div>
        </header>
        <main id="admin-main" tabIndex={-1} className="admin-main">
          {children}
        </main>
        <footer className="admin-canvas-footer">
          <span>Rennovex Technology</span>
          <span>Administration workspace</span>
        </footer>
      </div>
      <dialog
        ref={drawer}
        className="admin-drawer"
        aria-label="Admin navigation"
        onClose={() => trigger.current?.focus()}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (event.clientX > rect.right) drawer.current?.close();
          }
        }}
      >
        <button
          type="button"
          autoFocus
          onClick={() => drawer.current?.close()}
          className="admin-drawer-close"
          aria-label="Close navigation"
        >
          <X size={19} />
        </button>
        <div className="admin-drawer-inner">{sidebar}</div>
      </dialog>
    </div>
  );
}
