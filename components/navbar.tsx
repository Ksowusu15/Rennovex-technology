"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SiteLogo } from "@/components/site-logo";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Services", "/services"],
  ["Projects", "/projects"],
  ["Insights", "/blog"],
  ["Contact", "/contact"],
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function Navbar() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  const mobileMenu =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && (
          <>
            {/* Visual-only backdrop: softly dims and blurs the page without blocking scrolling. */}
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pointer-events-none fixed inset-x-0 bottom-0 top-[64px] z-[9997] bg-slate-950/10 backdrop-blur-[2px] sm:top-[72px] xl:hidden"
            />

            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-x-3 top-[70px] z-[9999] max-h-[calc(100dvh-92px)] overflow-hidden rounded-2xl border border-slate-200/90 bg-white/98 shadow-[0_24px_60px_rgba(15,23,42,0.24)] ring-1 ring-slate-950/5 backdrop-blur-xl sm:left-auto sm:right-5 sm:top-[80px] sm:w-[420px] xl:hidden"
            >
            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="max-h-[calc(100dvh-96px)] overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4"
            >
              <div className="grid gap-1">
                {links.map(([label, href]) => {
                  const active = isActivePath(pathname, href);

                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                })}

                <div className="my-2 border-t border-slate-200" />

                <Link
                  href="/client-portal"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-[15px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-950"
                >
                  Client portal
                </Link>

                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="enterprise-btn-primary mt-2 justify-center"
                >
                  Start a project
                </Link>
              </div>
            </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
      <header className="sticky top-0 z-[1000] border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="container-shell flex h-16 items-center justify-between gap-3 sm:h-[72px] sm:gap-6">
          <Link
            href="/"
            aria-label="Rennovex Technology home"
            className="shrink-0 scale-[.9] origin-left sm:scale-100"
            onClick={() => setOpen(false)}
          >
            <SiteLogo />
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-1 xl:flex">
            {links.map(([label, href]) => {
              const active = isActivePath(pathname, href);

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    active ? "text-blue-700" : "text-slate-700 hover:text-blue-700"
                  }`}
                >
                  {label}
                  {active && (
                    <motion.span
                      layoutId="primary-navigation-indicator"
                      className="absolute inset-x-3 -bottom-[19px] h-0.5 rounded-full bg-blue-600"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <Link
              href="/client-portal"
              className="rounded-lg border border-white/45 bg-white/55 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur-sm transition hover:bg-white/90 hover:text-blue-700"
            >
              Client portal
            </Link>
            <Link href="/contact" className="enterprise-btn-primary !px-4 !py-2.5">
              Start a project
            </Link>
          </div>

          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="relative z-[1001] grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/60 bg-white/80 text-slate-900 shadow-sm backdrop-blur-md transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 xl:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {mobileMenu}
    </>
  );
}
