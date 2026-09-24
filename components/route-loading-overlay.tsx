"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useSearchParams,
} from "next/navigation";
import { SiteLogo } from "@/components/site-logo";

const MINIMUM_VISIBLE_MS = 650;
const SAFETY_TIMEOUT_MS = 10000;

export function RouteLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname.startsWith("/admin");

  // Start visible so the loader is included in the initial HTML and appears
  // on a hard refresh / first visit, not only after client-side navigation.
  const [visible, setVisible] = useState(!isAdmin);
  const startedAtRef = useRef<number>(Date.now());
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const safetyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRouteEffectRef = useRef(true);

  function clearTimers() {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    if (safetyTimerRef.current) {
      clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }

  function showLoader() {
    clearTimers();
    startedAtRef.current = Date.now();
    setVisible(true);

    safetyTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, SAFETY_TIMEOUT_MS);
  }

  function hideLoaderAfterMinimumTime() {
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(
      MINIMUM_VISIBLE_MS - elapsed,
      0,
    );

    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, remaining);
  }

  useEffect(() => {
    if (isAdmin) {
      clearTimers();
      setVisible(false);
      return;
    }

    // On the first render, keep the server-rendered loader visible long enough
    // to be seen. On later route changes, this marks navigation as complete.
    if (firstRouteEffectRef.current) {
      firstRouteEffectRef.current = false;
      hideLoaderAfterMinimumTime();
      return;
    }

    hideLoaderAfterMinimumTime();
  }, [pathname, searchParams, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      return;
    }

    const handleNavigationStart = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as Element | null;
      const anchor = target?.closest(
        "a[href]",
      ) as HTMLAnchorElement | null;

      if (
        !anchor ||
        (anchor.target && anchor.target !== "_self") ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      const href = anchor.getAttribute("href");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      const destination = new URL(
        anchor.href,
        window.location.href,
      );
      const current = new URL(window.location.href);

      if (destination.origin !== current.origin) {
        return;
      }

      if (
        destination.pathname === current.pathname &&
        destination.search === current.search &&
        destination.hash === current.hash
      ) {
        return;
      }

      // Start the loader from the click event itself. Using pointerdown here
      // can mount the full-screen overlay before pointerup/click reaches the
      // Next.js Link, which can cancel navigation on some browsers/devices.
      // The click event is early enough to show feedback without blocking Link.
      showLoader();
    };

    window.addEventListener(
      "click",
      handleNavigationStart,
      true,
    );

    return () => {
      window.removeEventListener(
        "click",
        handleNavigationStart,
        true,
      );
      clearTimers();
    };
  }, [isAdmin]);

  if (!visible || isAdmin) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden"
      role="status"
      aria-live="polite"
      aria-label="Loading Rennovex Technology"
    >
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-md" />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative grid h-28 w-28 place-items-center sm:h-32 sm:w-32">
          <div
            className="absolute inset-0 rounded-full border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(2,12,35,0.22)] backdrop-blur-xl"
          />

          <div
            className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-cyan-400 border-t-blue-600"
          />

          <div
            className="relative grid h-[88px] w-[88px] place-items-center overflow-hidden rounded-full bg-white shadow-inner sm:h-[102px] sm:w-[102px]"
          >
            <div className="scale-[1.65]">
              <SiteLogo compact />
            </div>
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
