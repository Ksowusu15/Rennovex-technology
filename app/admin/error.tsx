"use client";

import { useEffect } from "react";
import { AlertTriangle, 
  RefreshCw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin workspace error:", 
      error);
  }, [error]);

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-sm sm:p-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
        <AlertTriangle size={26} />
      </div>
      <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
        The admin workspace could not finish loading
      </h1>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
        This is usually a temporary database or network delay. Your data has not been changed. Try loading the workspace again.
      </p>
      <button
        type="button"
        onClick={reset}
        className={`
  mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl
  bg-blue-700 px-5 py-3 text-sm font-bold text-white transition
  hover:bg-blue-800
`}
      >
        <RefreshCw size={16} />
        Try again
      </button>
    </section>
  );
}
