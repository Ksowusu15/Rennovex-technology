"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { PageLoadingIndicator } from "@/components/page-loading-indicator";

const MINIMUM_VISIBLE_MS = 150;
const SAFETY_TIMEOUT_MS = 10000;

export function RouteLoadingOverlay() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = pathname.startsWith("/admin");

  // Render initial feedback in server HTML, before hydration.
  const [visible, setVisible] = useState(true);
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
    const remaining = Math.max(MINIMUM_VISIBLE_MS - elapsed, 0);

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

    // Route changes mark navigation as complete.
    if (firstRouteEffectRef.current) {
      firstRouteEffectRef.current = false;
      return;
    }

    hideLoaderAfterMinimumTime();
  }, [pathname, searchParams, isAdmin]);

  useEffect(() => {
    if (isAdmin) return;

    startedAtRef.current = Date.now();
    const finishInitialLoad = () => {
      if (safetyTimerRef.current) {
        clearTimeout(safetyTimerRef.current);
        safetyTimerRef.current = null;
      }
      hideLoaderAfterMinimumTime();
    };

    safetyTimerRef.current = setTimeout(
      finishInitialLoad,
      SAFETY_TIMEOUT_MS,
    );

    if (document.readyState === "complete") {
      finishInitialLoad();
    } else {
      window.addEventListener("load", finishInitialLoad, { once: true });
    }

    return () => {
      window.removeEventListener("load", finishInitialLoad);
      clearTimers();
    };
  }, []);

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
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

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

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);

      if (destination.origin !== current.origin) {
        return;
      }

      if (
        destination.pathname === current.pathname &&
        destination.search === current.search
      ) {
        return;
      }

      // Start the loader from the click event itself. Using pointerdown here
      // can mount the full-screen overlay before pointerup/click reaches the
      // Next.js Link, which can cancel navigation on some browsers/devices.
      // The click event is early enough to show feedback without blocking Link.
      showLoader();
    };

    window.addEventListener("click", handleNavigationStart, true);

    return () => {
      window.removeEventListener("click", handleNavigationStart, true);
      clearTimers();
    };
  }, [isAdmin]);

  if (!visible || isAdmin) {
    return null;
  }

  return <PageLoadingIndicator />;
}
