"use client";

import Link from "next/link";
import { useEffect, 
  useRef, 
  useState } from "react";
import { ChevronDown, 
  KeyRound, 
  MonitorSmartphone, 
  ScrollText, 
  ShieldCheck, 
  UserRound } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

type Session = {
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

const roleLabel = {
  SUPER_ADMIN: "Super Administrator",
  ADMIN: "Administrator",
  EDITOR: "Editor",
} as const;

export function AdminProfileMenu({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (ref.current 
        && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", 
      close);
    return () => document.removeEventListener("mousedown", 
      close);
  }, []);

  return (
    <div 
      ref={ref} 
      className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`
  flex min-w-0 items-center gap-2 rounded-xl border border-slate-200
  bg-white p-1.5 pr-2.5 text-left shadow-sm transition
  hover:border-blue-200 hover:bg-blue-50
`}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-700 text-sm font-bold text-white">
          {session.name.slice(0, 
            1).toUpperCase()}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block max-w-36 truncate text-xs font-bold text-slate-900">
            {session.name}
          </span>
          <span className="block text-[11px] text-slate-500">
            {roleLabel[session.role]}
          </span>
        </span>
        <ChevronDown 
          size={15} 
          className={`text-slate-400 transition ${open 
            ? "rotate-180" 
            : ""}`} />
      </button>

      {open && (
        <div 
          role="menu" 
          className={`
  absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden
  rounded-2xl border border-slate-200 bg-white shadow-2xl
  shadow-slate-950/15
`}>
          <div className="border-b border-slate-100 p-4">
            <p className="truncate text-sm font-bold text-slate-950">
              {session.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {session.email}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
              <ShieldCheck size={13} /> 
              {roleLabel[session.role]}
            </span>
          </div>
          <div className="p-2">
            <Link 
              role="menuitem" 
              href="/admin/profile" 
              onClick={() => setOpen(false)} 
              className={`
  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold
  text-slate-700 transition hover:bg-slate-50 hover:text-slate-950
`}>
              <UserRound size={17} /> 
              My profile
            </Link>
            <Link 
              role="menuitem" 
              href="/admin/profile#password" 
              onClick={() => setOpen(false)} 
              className={`
  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold
  text-slate-700 transition hover:bg-slate-50 hover:text-slate-950
`}>
              <KeyRound size={17} /> 
              Change password
            </Link>
            <Link 
              role="menuitem" 
              href="/admin/profile/sessions" 
              onClick={() => setOpen(false)} 
              className={`
  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold
  text-slate-700 transition hover:bg-slate-50 hover:text-slate-950
`}>
              <MonitorSmartphone size={17} /> 
              Active sessions
            </Link>
            {session.role === "SUPER_ADMIN" && (
              <Link 
                role="menuitem" 
                href="/admin/activity" 
                onClick={() => setOpen(false)} 
                className={`
  flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold
  text-slate-700 transition hover:bg-slate-50 hover:text-slate-950
`}>
                <ScrollText size={17} /> 
                Security activity
              </Link>
            )}
          </div>
          <div className="border-t border-slate-100 p-2">
            <LogoutButton 
              compact 
              onBeforeLogout={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
