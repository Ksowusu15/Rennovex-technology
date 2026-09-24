import Link from "next/link";
import { BookOpenText, 
  CalendarPlus, 
  FolderPlus, 
  MessageSquareText, 
  Plus, 
  Settings2, 
  Users } from "lucide-react";

type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export function AdminQuickActions({ role }: { role: Role }) {
  const actions = [
    { label: "Add project", 
      detail: "Publish a new project", 
      href: "/admin/projects#project-form", 
      icon: FolderPlus, 
      roles: ["SUPER_ADMIN", 
      "ADMIN", 
      "EDITOR"] },
    { label: "Write article", 
      detail: "Create a blog draft", 
      href: "/admin/blog#blog-form", 
      icon: BookOpenText, 
      roles: ["SUPER_ADMIN", 
      "ADMIN", 
      "EDITOR"] },
    { label: "Review messages", 
      detail: "Respond to new enquiries", 
      href: "/admin/messages", 
      icon: MessageSquareText, 
      roles: ["SUPER_ADMIN", 
      "ADMIN"] },
    { label: "View bookings", 
      detail: "Manage consultations", 
      href: "/admin/bookings", 
      icon: CalendarPlus, 
      roles: ["SUPER_ADMIN", 
      "ADMIN"] },
    { label: "Site settings", 
      detail: "Update branding and contact details", 
      href: "/admin/settings", 
      icon: Settings2, 
      roles: ["SUPER_ADMIN", 
      "ADMIN"] },
    { label: "Manage team", 
      detail: "Create admins and editors", 
      href: "/admin/users", 
      icon: Users, 
      roles: ["SUPER_ADMIN"] },
  ].filter((action) => action.roles.includes(role));

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950 sm:text-xl">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-500">Common tasks for your role.</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
          <Plus size={18} />
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {actions.map(({ label, detail, href, icon: Icon }) => (
          <Link 
            key={label} 
            href={href} 
            className={`
  group flex items-start gap-3 rounded-2xl border border-slate-200 p-4
  transition hover:-translate-y-0.5 hover:border-blue-200
  hover:bg-blue-50/40 hover:shadow-md
`}>
            <span className={`
  grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100
  text-slate-700 transition group-hover:bg-blue-700 group-hover:text-white
`}>
              <Icon size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-900">
                {label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">
                {detail}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
