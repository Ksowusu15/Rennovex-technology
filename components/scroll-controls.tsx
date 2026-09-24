"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export function ScrollControls({ alwaysVisible = false }: { alwaysVisible?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [canGoUp, setCanGoUp] = useState(false);
  const [canGoDown, setCanGoDown] = useState(false);

  useEffect(() => {
    setMounted(true);

    function update() {
      const y = window.scrollY;
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      setCanGoUp(y > 160);
      setCanGoDown(max > 0 && y < max - 160);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Render the same markup on the server and during the first browser pass.
  // This prevents the disabled-state hydration warning on auth pages.
  if (!mounted) return null;

  const visible = alwaysVisible || canGoUp || canGoDown;
  if (!visible) return null;

  return (
    <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-[60] flex flex-col gap-2 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:right-6">
      {(alwaysVisible || canGoUp) && (
        <button
          type="button"
          aria-label="Scroll to top"
          title="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          disabled={!canGoUp}
          className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowUp size={19} />
        </button>
      )}

      {(alwaysVisible || canGoDown) && (
        <button
          type="button"
          aria-label="Scroll to bottom"
          title="Scroll to bottom"
          onClick={() =>
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: "smooth",
            })
          }
          disabled={!canGoDown}
          className="grid h-11 w-11 place-items-center rounded-full border border-blue-600 bg-blue-700 text-white shadow-lg shadow-blue-700/20 transition hover:translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowDown size={19} />
        </button>
      )}
    </div>
  );
}
