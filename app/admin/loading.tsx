import { LoaderCircle } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white">
              <LoaderCircle className="animate-spin" size={21} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Admin Portal</p>
              <p className="text-xs text-slate-500">Loading your workspace...</p>
            </div>
          </div>
          <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
              <div className="mt-5 h-3 w-20 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 h-8 w-14 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}
