"use client";

import { Archive, Loader2, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type Props = {
  kind: "archive" | "clear";
  label: string;
  message: string;
};

export function ConfirmLogAction({ kind, label, message }: Props) {
  const { pending } = useFormStatus();
  const Icon = kind === "archive" ? Archive : Trash2;
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
      className={kind === "archive"
        ? "inline-flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
        : "inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {pending ? "Processing..." : label}
    </button>
  );
}
