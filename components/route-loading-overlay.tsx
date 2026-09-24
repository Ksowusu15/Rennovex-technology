"use client";

import { usePathname, 
  useSearchParams } from "next/navigation";
import { useEffect, 
  useRef, 
  useState } from "react";
import { SiteLogo } from "@/components/site-logo";

export function RouteLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 
      180);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [pathname, 
    searchParams]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented 
        || event.button !== 0 
        || event.metaKey 
        || event.ctrlKey 
        || event.shiftKey 
        || event.altKey) return;
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor 
        || (anchor.target 
        && anchor.target !== "_self") 
        || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href 
        || href.startsWith("#") 
        || href.startsWith("mailto:") 
        || href.startsWith("tel:")) return;
      const destination = new URL(anchor.href, 
        window.location.href);
      if (destination.origin !== window.location.origin) return;
      const current = new URL(window.location.href);
      if (destination.pathname === current.pathname 
        && destination.search === current.search) return;
      setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 
        8000);
    };
    window.addEventListener("click", 
      onClick, 
      true);
    return () => window.removeEventListener("click", 
      onClick, 
      true);
  }, []);

  if (!visible) return null;
  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden" 
      role="status" 
      aria-live="polite" 
      aria-label="Loading Rennovex Technology">
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-md" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
          <div className={`
  absolute inset-0 rounded-full border border-white/70 bg-white/90
  shadow-[0_20px_60px_rgba(2,12,35,0.22)] backdrop-blur-xl
`} />
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-cyan-400 border-t-blue-600" />
          <div className={`
  relative grid h-[88px] w-[88px] place-items-center overflow-hidden
  rounded-full bg-white shadow-inner sm:h-[102px] sm:w-[102px]
`}>
            <div className="scale-[1.65]">
              <SiteLogo compact />
            </div>
          </div>
        </div>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.24em] text-[#071d49]">Rennovex Technology</p>
        <p className="mt-2 text-sm font-medium text-slate-700">Preparing your experience...</p>
      </div>
    </div>
  );
}
