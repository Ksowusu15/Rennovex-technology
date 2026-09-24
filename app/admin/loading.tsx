import { SiteLogo } from "@/components/site-logo";

export default function AdminLoading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      role="status"
      aria-label="Loading Rennovex admin portal"
    >
      <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-md" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
          <div className={`
  absolute inset-0 rounded-full border border-white/70 bg-white/90
  shadow-[0_20px_60px_rgba(2,12,35,0.25)] backdrop-blur-xl
`} />

          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-blue-600 border-r-cyan-400" />

          <div className={`
  relative grid h-[88px] w-[88px] place-items-center overflow-hidden
  rounded-full bg-white shadow-inner sm:h-[102px] sm:w-[102px]
`}>
            <div className="scale-[1.65]">
              <SiteLogo compact />
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-white">
          Rennovex Technology
        </p>

        <p className="mt-2 text-sm font-medium text-white/85">
          Loading admin workspace...
        </p>
      </div>
    </div>
  );
}
