"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

export function AdminToast({ message, type = "success" }: { message?: string; type?: "success" | "error" }) {
  const [visible, setVisible] = useState(Boolean(message));
  useEffect(() => {
    setVisible(Boolean(message));
    if (!message) return;
    const timer = window.setTimeout(() => setVisible(false), 4500);
    return () => window.clearTimeout(timer);
  }, [message]);
  if (!message || !visible) return null;
  const error = type === "error";
  return (
    <div className={`fixed inset-x-3 top-20 sm:inset-x-auto sm:right-4 sm:top-24 z-[80] flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`} role="status">
      {error ? <CircleAlert className="mt-0.5 shrink-0" size={19} /> : <CheckCircle2 className="mt-0.5 shrink-0" size={19} />}
      <p className="text-sm font-semibold leading-6">{message}</p>
      <button type="button" onClick={() => setVisible(false)} className="ml-auto rounded-lg p-1 transition hover:bg-black/5" aria-label="Dismiss notification"><X size={16}/></button>
    </div>
  );
}
