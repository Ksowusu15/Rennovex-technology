"use client";

import Link from "next/link";
import {
  ChevronDown,
  Code2,
  Globe2,
  Menu,
  Palette,
  PanelsTopLeft,
  ServerCog,
  ShoppingBag,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SiteLogo } from "@/components/site-logo";

const serviceLinks = [
  {
    label: "Website Development",
    href: "/services/website-development",
    description: "Professional websites built for credibility and growth.",
    icon: Globe2,
  },
  {
    label: "E-commerce Development",
    href: "/services/e-commerce-development",
    description: "Online stores with payments, products and customer tools.",
    icon: ShoppingBag,
  },
  {
    label: "Custom Software Development",
    href: "/services/custom-software-development",
    description: "Tailored systems, portals, dashboards and automation.",
    icon: Code2,
  },
  {
    label: "UI/UX Design",
    href: "/services/ui-ux-design",
    description: "Clear, intuitive interfaces and product experiences.",
    icon: PanelsTopLeft,
  },
  {
    label: "Graphic Design & Branding",
    href: "/services/graphic-design",
    description: "Brand identities and professional marketing assets.",
    icon: Palette,
  },
  {
    label: "IT Solutions & Consulting",
    href: "/services/it-consulting",
    description: "Practical IT guidance, planning and implementation support.",
    icon: ServerCog,
  },
] as const;

const pricingLinks = [
  ["Web & Software Development Packages", "/pricing/web-software"],
  ["Graphic Design & Branding Packages", "/pricing/branding"],
  ["IT Solutions & Consulting", "/pricing/it-solutions"],
  ["View All Pricing", "/pricing"],
] as const;

const companyLinks = [
  ["About Rennovex", "/about"],
  ["Contact Us", "/contact"],
] as const;

const resourceLinks = [
  ["Case Studies", "/case-studies"],
  ["FAQs", "/faq"],
  ["Privacy Policy", "/privacy"],
  ["Terms of Service", "/terms"],
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function NavLink({
  label,
  href,
  pathname,
}: {
  label: string;
  href: string;
  pathname: string;
}) {
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`
        group relative rounded-lg px-3 py-2 text-sm font-semibold
        transition-all duration-300
        ${
          active
            ? "bg-blue-50/70 text-blue-700"
            : "text-slate-700 hover:-translate-y-0.5 hover:bg-blue-50/60 hover:text-blue-700"
        }
      `}
    >
      {label}

      {!active && (
        <span
          className={`
            absolute inset-x-3 bottom-1 h-0.5 origin-center scale-x-0
            rounded-full bg-blue-600 transition-transform duration-300
            group-hover:scale-x-100
          `}
        />
      )}
    </Link>
  );
}

function SimpleDesktopDropdown({
  label,
  links,
  pathname,
}: {
  label: string;
  links: readonly (readonly [string, string])[];
  pathname: string;
}) {
  const active = links.some(([, href]) => isActivePath(pathname, href));

  return (
    <div className="group relative">
      <button
        type="button"
        className={`
          flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold
          transition-all duration-300
          ${
            active
              ? "bg-blue-50/70 text-blue-700"
              : "text-slate-700 hover:-translate-y-0.5 hover:bg-blue-50/60 hover:text-blue-700"
          }
        `}
      >
        {label}

        <ChevronDown
          size={15}
          className="transition-transform group-hover:rotate-180"
        />
      </button>

      <div
        className={`
          pointer-events-none absolute left-1/2 top-full z-[1100] w-80
          -translate-x-1/2 translate-y-2 pt-3 opacity-0
          transition-all duration-200
          group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100
          group-focus-within:pointer-events-auto group-focus-within:translate-y-0
          group-focus-within:opacity-100
        `}
      >
        <div
          className={`
            rounded-2xl border border-slate-200 bg-white p-2
            shadow-[0_20px_55px_rgba(15,23,42,.16)]
          `}
        >
          {links.map(([item, href]) => (
            <Link
              key={href}
              href={href}
              className={`
                  block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700
                  transition hover:bg-blue-50 hover:text-blue-700
                `}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesMegaMenu({ pathname }: { pathname: string }) {
  const active = pathname.startsWith("/services");

  return (
    <div className="group relative">
      <button
        type="button"
        className={`
          flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold
          transition-all duration-300
          ${
            active
              ? "bg-blue-50/70 text-blue-700"
              : "text-slate-700 hover:-translate-y-0.5 hover:bg-blue-50/60 hover:text-blue-700"
          }
        `}
      >
        Services
        <ChevronDown
          size={15}
          className="transition-transform group-hover:rotate-180"
        />
      </button>

      <div
        className={`
          pointer-events-none fixed left-1/2 top-16 z-[1100]
          w-[min(960px,calc(100vw-48px))]
          -translate-x-1/2 pt-2 opacity-0
          transition-opacity duration-150
          group-hover:pointer-events-auto group-hover:opacity-100
          group-focus-within:pointer-events-auto
          group-focus-within:opacity-100
          sm:top-16
        `}
      >
        <span aria-hidden="true" className="absolute inset-x-0 -top-3 h-5" />

        <div
          className={`
            w-full overflow-hidden rounded-3xl
            border border-slate-200 bg-white
            shadow-[0_28px_70px_rgba(15,23,42,.18)]
          `}
        >
          <div className="grid grid-cols-2 gap-2 p-4">
            {serviceLinks.map((service) => {
              const Icon = service.icon;

              return (
                <Link
                  key={service.href}
                  href={service.href}
                  className={`
                      group/item flex gap-4 rounded-2xl p-4
                      transition duration-200 hover:bg-blue-50
                    `}
                >
                  <span
                    className={`
                        grid h-11 w-11 shrink-0 place-items-center rounded-xl
                        border border-blue-100 bg-blue-50 text-blue-700
                        transition group-hover/item:bg-blue-700
                        group-hover/item:text-white
                      `}
                  >
                    <Icon size={20} />
                  </span>

                  <span>
                    <span className="block text-sm font-bold text-slate-950">
                      {service.label}
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {service.description}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          <div
            className={`
              flex flex-col gap-4 border-t border-slate-200
              bg-slate-50 px-6 py-4
              lg:flex-row lg:items-center lg:justify-between
            `}
          >
            <div>
              <p className="text-sm font-bold text-slate-900">
                Not sure which service fits?
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Tell us what you are trying to achieve and we will recommend the
                right approach.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href="/services"
                className="text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                View all services
              </Link>

              <Link href="/contact" className="enterprise-btn-primary !px-4 !py-2.5">
                Discuss a project
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileDropdown({
  label,
  links,
  open,
  setOpen,
  closeMenu,
}: {
  label: string;
  links: readonly (readonly [string, string])[];
  open: boolean;
  setOpen: () => void;
  closeMenu: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={setOpen}
        className={`
          flex items-center justify-between rounded-xl px-4 py-3
          text-left text-[15px] font-semibold text-slate-700
          hover:bg-blue-50/70 hover:text-blue-700
        `}
        aria-expanded={open}
      >
        {label}

        <ChevronDown
          size={17}
          className={`
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="overflow-hidden"
          >
            <div className="grid gap-1 border-l-2 border-blue-100 py-1 pl-3">
              {links.map(([item, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`
                      rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600
                      hover:bg-blue-50 hover:text-blue-700
                    `}
                >
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileServices({
  open,
  setOpen,
  closeMenu,
}: {
  open: boolean;
  setOpen: () => void;
  closeMenu: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={setOpen}
        className={`
          flex items-center justify-between rounded-xl px-4 py-3
          text-left text-[15px] font-semibold text-slate-700
          hover:bg-blue-50/70 hover:text-blue-700
        `}
        aria-expanded={open}
      >
        Services
        <ChevronDown
          size={17}
          className={`
            transition-transform
            ${open ? "rotate-180" : ""}
          `}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            className="overflow-hidden"
          >
            <div className="grid gap-1 border-l-2 border-blue-100 py-1 pl-3">
              {serviceLinks.map((service) => (
                <Link
                  key={service.href}
                  href={service.href}
                  onClick={closeMenu}
                  className={`
                      rounded-lg px-3 py-2.5
                      hover:bg-blue-50
                    `}
                >
                  <span className="block text-sm font-semibold text-slate-700">
                    {service.label}
                  </span>

                  <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                    {service.description}
                  </span>
                </Link>
              ))}

              <Link
                href="/services"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-bold text-blue-700"
              >
                View All Services
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
    setPricingOpen(false);
    setCompanyOpen(false);
    setResourcesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const key = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const links = menuRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        );
        const visible = Array.from(links ?? []).filter(
          (element) => element.getClientRects().length > 0,
        );
        const first = visible[0];
        const last = visible[visible.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          buttonRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          buttonRef.current?.focus();
        } else if (document.activeElement === buttonRef.current) {
          event.preventDefault();
          (event.shiftKey ? last : first)?.focus();
        }
      }
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const outside = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", key);
    document.addEventListener("pointerdown", outside);

    return () => {
      window.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  const closeMenu = () => {
    setOpen(false);
    setServicesOpen(false);
    setPricingOpen(false);
    setCompanyOpen(false);
    setResourcesOpen(false);
  };

  const mobile =
    mounted &&
    createPortal(
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              aria-hidden="true"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className={`
                pointer-events-none fixed inset-x-0 bottom-0 top-[64px]
                z-[9997] bg-slate-950/10 backdrop-blur-[2px]
                sm:top-[72px] xl:hidden
              `}
            />

            <motion.div
              ref={menuRef}
              initial={{
                opacity: 0,
                y: -12,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}
              className={`
                fixed inset-x-3 top-[70px] z-[9999]
                max-h-[calc(100dvh-92px)] overflow-hidden rounded-2xl
                border border-slate-200 bg-white
                shadow-[0_24px_60px_rgba(15,23,42,.24)]
                sm:left-auto sm:right-5 sm:top-[80px] sm:w-[420px]
                xl:hidden
              `}
            >
              <nav
                id="mobile-navigation"
                className={`
                  max-h-[calc(100dvh-96px)] overflow-y-auto
                  px-3 py-3 sm:px-4
                `}
              >
                <div className="grid gap-1">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={`
                      rounded-xl px-4 py-3 text-[15px] font-semibold
                      text-slate-700 hover:bg-blue-50 hover:text-blue-700
                    `}
                  >
                    Home
                  </Link>

                  <MobileServices
                    open={servicesOpen}
                    setOpen={() => setServicesOpen((value) => !value)}
                    closeMenu={closeMenu}
                  />

                  <MobileDropdown
                    label="Pricing"
                    links={pricingLinks}
                    open={pricingOpen}
                    setOpen={() => setPricingOpen((value) => !value)}
                    closeMenu={closeMenu}
                  />

                  <MobileDropdown
                    label="Company"
                    links={companyLinks}
                    open={companyOpen}
                    setOpen={() => setCompanyOpen((value) => !value)}
                    closeMenu={closeMenu}
                  />

                  <Link
                    href="/projects"
                    onClick={closeMenu}
                    className={`
                      rounded-xl px-4 py-3 text-[15px] font-semibold
                      text-slate-700 hover:bg-blue-50 hover:text-blue-700
                    `}
                  >
                    Projects
                  </Link>

                  <Link
                    href="/blog"
                    onClick={closeMenu}
                    className={`
                      rounded-xl px-4 py-3 text-[15px] font-semibold
                      text-slate-700 hover:bg-blue-50 hover:text-blue-700
                    `}
                  >
                    Insights
                  </Link>

                  <MobileDropdown
                    label="Resources"
                    links={resourceLinks}
                    open={resourcesOpen}
                    setOpen={() => setResourcesOpen((value) => !value)}
                    closeMenu={closeMenu}
                  />

                  <div className="my-2 border-t border-slate-200" />

                  <Link
                    href="/client-portal"
                    onClick={closeMenu}
                    className={`
                      rounded-xl px-4 py-3 text-[15px] font-semibold
                      text-slate-700 hover:bg-slate-50
                    `}
                  >
                    Client Support
                  </Link>

                  <Link
                    href="/contact"
                    onClick={closeMenu}
                    className="enterprise-btn-primary mt-2 justify-center"
                  >
                    Become a Client
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
      <header
        className={`
          sticky top-0 z-[1000] border-b border-slate-100
          bg-white/95 shadow-sm backdrop-blur-xl
        `}
      >
        <div
          className={`
            container-shell flex h-16 items-center justify-between
            gap-3 sm:h-[72px] sm:gap-6
          `}
        >
          <Link
            href="/"
            aria-label="Rennovex Technology home"
            className="shrink-0 origin-left scale-[.9] sm:scale-100"
            onClick={() => setOpen(false)}
          >
            <SiteLogo />
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 xl:flex"
          >
            <NavLink label="Home" href="/" pathname={pathname} />

            <ServicesMegaMenu pathname={pathname} />

            <SimpleDesktopDropdown
              label="Pricing"
              links={pricingLinks}
              pathname={pathname}
            />

            <SimpleDesktopDropdown
              label="Company"
              links={companyLinks}
              pathname={pathname}
            />

            <NavLink label="Projects" href="/projects" pathname={pathname} />

            <NavLink label="Insights" href="/blog" pathname={pathname} />

            <SimpleDesktopDropdown
              label="Resources"
              links={resourceLinks}
              pathname={pathname}
            />
          </nav>

          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <Link
              href="/client-portal"
              className={`
                rounded-lg border border-slate-200 bg-white px-3 py-2
                text-sm font-semibold text-slate-800 transition
                hover:border-blue-200 hover:text-blue-700
              `}
            >
              Client Support
            </Link>

            <Link href="/contact" className="enterprise-btn-primary !px-4 !py-2.5">
              Become a Client
            </Link>
          </div>

          <button
            ref={buttonRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            className={`
              grid h-10 w-10 place-items-center rounded-lg
              border border-slate-200 bg-white text-slate-900 shadow-sm
              transition hover:border-blue-200 hover:text-blue-700
              xl:hidden
            `}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {mobile}
    </>
  );
}
