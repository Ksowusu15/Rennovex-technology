"use client";

import Link from "next/link";
import { useEffect, 
  useRef, 
  useState } from "react";
import { Bell, 
  Bot, 
  CalendarDays, 
  Mail, 
  ReceiptText, 
  X } from "lucide-react";

type NotificationSummary = {
  unreadMessages: number;
  newQuotes: number;
  pendingBookings: number;
  assistantReplies: number;
};

const notificationItems = [
  { key: "unreadMessages", 
    label: "Unread messages", 
    href: "/admin/messages", 
    icon: Mail, 
    tone: "bg-blue-50 text-blue-700" },
  { key: "newQuotes", 
    label: "New quote requests", 
    href: "/admin/quotes", 
    icon: ReceiptText, 
    tone: "bg-violet-50 text-violet-700" },
  { key: "pendingBookings", 
    label: "Pending consultations", 
    href: "/admin/bookings", 
    icon: CalendarDays, 
    tone: "bg-amber-50 text-amber-700" },
  { key: "assistantReplies", 
    label: "Assistant replies needed", 
    href: "/admin/assistant", 
    icon: Bot, 
    tone: "bg-emerald-50 text-emerald-700" },
] as const;

export function AdminNotifications({ summary }: { summary: NotificationSummary }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = Object.values(summary).reduce((sum, 
    count) => sum + count, 
    0);

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
        aria-label={`Notifications${total 
          ? `, ${total} pending` 
          : ""}`}
        aria-expanded={open}
        className={`
  relative grid h-11 w-11 place-items-center rounded-xl border
  border-slate-200 bg-white text-slate-600 shadow-sm transition
  hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700
`}
      >
        <Bell size={19} />
        {total > 0 && (
          <span className={`
  absolute -right-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center
  rounded-full border-2 border-white bg-rose-500 px-1 text-[10px]
  font-bold text-white
`}>
            {total > 99 
              ? "99+" 
              : total}
          </span>
        )}
      </button>

      {open && (
        <div className={`
  fixed inset-x-3 top-[82px] z-50 max-h-[calc(100dvh-98px)]
  overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl
  shadow-slate-950/15 sm:absolute sm:inset-x-auto sm:right-0
  sm:top-[calc(100%+10px)] sm:max-h-[min(32rem,calc(100dvh-110px))]
  sm:w-[22rem]
`}>
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <div>
              <p className="text-sm font-bold text-slate-950">Notifications</p>
              <p className="mt-0.5 text-xs text-slate-500">Customer and website activity</p>
            </div>
            <button 
              type="button" 
              onClick={() => setOpen(false)} 
              aria-label="Close notifications" 
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700">
              <X size={17} />
            </button>
          </div>

          <div className="max-h-[calc(100dvh-210px)] overflow-y-auto p-2 sm:max-h-[24rem]">
            {notificationItems.map(({ key, label, href, icon: Icon, tone }) => {
              const count = summary[key];
              return (
                <Link 
                  key={key} 
                  href={href} 
                  onClick={() => setOpen(false)} 
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tone}`}>
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-800">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-500">
                      {count 
                      ? `${count} item${count === 1 
                      ? "" 
                      : "s"} need attention` 
                      : "Nothing pending"}
                    </span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${count 
                    ? "bg-slate-950 text-white" 
                    : "bg-slate-100 text-slate-400"}`}>
                    {count}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
            {total 
              ? `${total} outstanding item${total === 1 
              ? "" 
              : "s"} across the workspace.` 
              : "You are all caught up."}
          </div>
        </div>
      )}
    </div>
  );
}
