import { LoadingLogo } from "@/components/loading-logo";

export function PageLoadingIndicator() {
  return (
    <div
      className={[
        "pointer-events-none fixed inset-0 z-[10000] flex items-center",
        "justify-center overflow-hidden",
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-label="Loading Rennovex Technology"
    >
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-md" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
          <div
            className={[
              "absolute inset-0 rounded-full border border-white/70 bg-white/90",
              "shadow-[0_20px_60px_rgba(2,12,35,0.22)] backdrop-blur-xl",
            ].join(" ")}
          />

          <div
            className={[
              "absolute inset-0 animate-spin rounded-full border-[3px]",
              "border-transparent border-r-cyan-400 border-t-blue-600",
            ].join(" ")}
          />

          <div
            className={[
              "relative grid h-[88px] w-[88px] place-items-center overflow-hidden",
              "rounded-full bg-white shadow-inner sm:h-[102px] sm:w-[102px]",
            ].join(" ")}
          >
            <LoadingLogo />
          </div>
        </div>

        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[#071d49]">
          Rennovex Technology
        </p>

        <p className="mt-2 text-sm font-medium text-slate-700">
          Preparing your experience...
        </p>
      </div>
    </div>
  );
}
