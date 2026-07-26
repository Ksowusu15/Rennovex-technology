import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <main className="relative min-h-[70vh] overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.09),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.08),transparent_30%)]" />
      <div className="container-shell relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-950/10">
          <div className="absolute inset-2 rounded-xl bg-blue-50" />
          <LoaderCircle className="relative animate-spin text-blue-700" size={28} strokeWidth={2.2} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">Rennovex Technology</p>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Preparing your experience</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Loading the page and getting everything ready for you.</p>
        <div className="mt-7 h-1.5 w-44 overflow-hidden rounded-full bg-slate-200">
          <div className="professional-loading-bar h-full w-2/5 rounded-full bg-blue-700" />
        </div>
      </div>
    </main>
  );
}
