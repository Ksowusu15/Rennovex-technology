"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    eyebrow: "WEB DESIGN & DEVELOPMENT",
    title: "Build a Website That Works as Hard as You Do",
    accent: "Modern, fast and built to convert",
    description:
      "Professional websites designed around your brand, your customers and your business goals. Responsive on every screen and ready to grow with you.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=2000&q=90",
    href: "/services/website-development",
    cta: "Explore Web Development",
  },
  {
    eyebrow: "E-COMMERCE DEVELOPMENT",
    title: "Turn Your Products Into a Store That Sells Around the Clock",
    accent: "Fast, secure and built for effortless shopping",
    description:
      "We build professional online stores with product management, payments, inventory, customer accounts and order workflows designed to help growing businesses sell with confidence.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=2000&q=90",
    href: "/services/e-commerce-development",
    cta: "Explore E-commerce",
  },
  {
    eyebrow: "CUSTOM SOFTWARE DEVELOPMENT",
    title: "Turn Complex Work Into Simple Software",
    accent: "Solutions built around your business",
    description:
      "From internal platforms and customer portals to APIs and automation, we build reliable software that solves real operational problems.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=2000&q=90",
    href: "/services/custom-software-development",
    cta: "Explore Custom Software",
  },
  {
    eyebrow: "UI/UX DESIGN",
    title: "Create Digital Experiences People Enjoy Using",
    accent: "Clear, intuitive and thoughtfully designed",
    description:
      "We turn ideas and workflows into polished user experiences with purposeful interfaces, responsive layouts and practical design systems.",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=2000&q=90",
    href: "/services/ui-ux-design",
    cta: "Explore UI/UX Design",
  },
  {
    eyebrow: "GRAPHIC DESIGN",
    title: "Give Your Brand a Stronger Visual Identity",
    accent: "Creative design with business purpose",
    description:
      "From brand assets to campaign graphics and digital content, we create visual systems that help your business look consistent and memorable.",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=2000&q=90",
    href: "/services/graphic-design",
    cta: "Explore Graphic Design",
  },
  {
    eyebrow: "IT CONSULTING",
    title: "Make Better Technology Decisions",
    accent: "Practical guidance for modern businesses",
    description:
      "We help businesses improve infrastructure, systems, security and technology planning with clear recommendations and dependable support.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2000&q=90",
    href: "/services/it-consulting",
    cta: "Explore IT Consulting",
  },
] as const;

export function Hero() {
  const [active, setActive] = useState(0);
  const [serviceWindowStart, setServiceWindowStart] = useState(0);
  const touchStartY = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const goTo = (index: number) => {
    setActive((index + slides.length) % slides.length);
  };

  const maxServiceWindowStart = slides.length - 4;

  const moveServiceWindow = (direction: "up" | "down") => {
    setServiceWindowStart((current) => {
      if (direction === "down") {
        return Math.min(current + 1, maxServiceWindowStart);
      }

      return Math.max(current - 1, 0);
    });
  };

  useEffect(() => {
    if (active < serviceWindowStart) {
      setServiceWindowStart(active);
      return;
    }

    if (active > serviceWindowStart + 3) {
      setServiceWindowStart(
        Math.min(active - 3, maxServiceWindowStart),
      );
    }
  }, [active, serviceWindowStart, maxServiceWindowStart]);

  const visibleServices = slides.slice(
    serviceWindowStart,
    serviceWindowStart + 4,
  );

  const slide = slides[active];

  return (
    <section
      className={`
        relative min-h-[600px] overflow-hidden
        bg-slate-950 text-white
        lg:min-h-[660px]
      `}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slide.image}
            alt={slide.eyebrow.toLowerCase()}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,10,25,.94)_0%,rgba(3,17,34,.82)_42%,rgba(3,15,28,.48)_68%,rgba(2,8,20,.72)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />

      <div
        className={`
          container-shell relative z-10 grid
          min-h-[600px] items-start gap-10 py-10
          sm:py-12
          lg:min-h-[660px]
          lg:grid-cols-[minmax(0,1fr)_360px]
          lg:items-start lg:py-12
        `}
      >
        <div className="max-w-3xl pt-2 sm:pt-3 lg:pt-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -14 }}
              transition={{ duration: 0.45 }}
            >
              <div
                className={`
                  flex items-center gap-3 text-xs font-extrabold
                  tracking-[.18em] text-blue-300 sm:text-sm
                `}
              >
                <span className="h-px w-9 bg-blue-400" />
                {slide.eyebrow}
              </div>

              <h1
                className={`
                  mt-6 max-w-3xl text-[2.65rem] font-black
                  leading-[.98] tracking-[-.055em]
                  sm:text-6xl lg:text-7xl
                `}
              >
                {slide.title}
              </h1>

              <p className="mt-5 text-xl font-bold text-blue-300 sm:text-2xl">
                {slide.accent}
              </p>

              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                {slide.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={slide.href}
                  className={`
                    inline-flex items-center justify-center gap-2
                    rounded-xl bg-blue-600 px-6 py-3.5
                    text-sm font-bold text-white
                    shadow-lg shadow-blue-950/25 transition
                    hover:-translate-y-0.5 hover:bg-blue-500
                  `}
                >
                  {slide.cta}
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/pricing"
                  className={`
                    inline-flex items-center justify-center
                    rounded-xl border border-white/35 bg-white/10
                    px-6 py-3.5 text-sm font-bold text-white
                    backdrop-blur-md transition
                    hover:bg-white hover:text-slate-950
                  `}
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Previous service"
              className={`
                grid h-12 w-12 place-items-center rounded-full
                border border-white/40 bg-white/10
                backdrop-blur transition
                hover:bg-white hover:text-slate-950
              `}
            >
              <ArrowLeft size={21} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Next service"
              className={`
                grid h-12 w-12 place-items-center rounded-full
                border border-white/40 bg-white/10
                backdrop-blur transition
                hover:bg-white hover:text-slate-950
              `}
            >
              <ArrowRight size={21} />
            </button>
            <span className="ml-2 text-xs font-bold tracking-[.16em] text-slate-300">
              {String(active + 1).padStart(2, "0")} /{" "}
              {String(slides.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div
          className={`
            hidden border-l border-white/20 pl-8
            lg:block lg:pt-20 xl:pt-24
          `}
          onWheel={(event) => {
            if (Math.abs(event.deltaY) < 8) return;

            moveServiceWindow(
              event.deltaY > 0 ? "down" : "up",
            );
          }}
          onTouchStart={(event) => {
            touchStartY.current = event.touches[0]?.clientY ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartY.current === null) return;

            const endY = event.changedTouches[0]?.clientY;
            if (endY === undefined) return;

            const distance = touchStartY.current - endY;
            touchStartY.current = null;

            if (Math.abs(distance) < 28) return;

            moveServiceWindow(
              distance > 0 ? "down" : "up",
            );
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[.2em] text-slate-400">
                Our services
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                Scroll or swipe to explore
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveServiceWindow("up")}
                disabled={serviceWindowStart === 0}
                aria-label="Show previous services"
                className={`
                  grid h-8 w-8 place-items-center rounded-full
                  border border-white/20 bg-white/5
                  text-slate-300 transition
                  hover:border-white/40 hover:bg-white/10 hover:text-white
                  disabled:cursor-not-allowed disabled:opacity-30
                `}
              >
                <ArrowUp size={15} />
              </button>

              <button
                type="button"
                onClick={() => moveServiceWindow("down")}
                disabled={
                  serviceWindowStart === maxServiceWindowStart
                }
                aria-label="Show more services"
                className={`
                  grid h-8 w-8 place-items-center rounded-full
                  border border-white/20 bg-white/5
                  text-slate-300 transition
                  hover:border-white/40 hover:bg-white/10 hover:text-white
                  disabled:cursor-not-allowed disabled:opacity-30
                `}
              >
                <ArrowDown size={15} />
              </button>
            </div>
          </div>

          <div className="overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={serviceWindowStart}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, y: 14 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, y: -10 }
                }
                transition={{ duration: 0.28 }}
                className="space-y-1"
              >
                {visibleServices.map((item) => {
                  const index = slides.indexOf(item);

                  return (
                    <button
                      key={item.eyebrow}
                      type="button"
                      onClick={() => goTo(index)}
                      className={`
                        group flex w-full items-center gap-3 py-3
                        text-left text-sm font-bold tracking-[.04em]
                        transition
                        ${
                          index === active
                            ? "text-blue-300"
                            : "text-slate-400 hover:text-white"
                        }
                      `}
                    >
                      <span
                        className={`
                          h-px transition-all
                          ${
                            index === active
                              ? "w-10 bg-blue-400"
                              : `
                                  w-6 bg-slate-500
                                  group-hover:w-8 group-hover:bg-white
                                `
                          }
                        `}
                      />
                      {item.eyebrow}
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: maxServiceWindowStart + 1 }).map(
              (_, index) => (
                <button
                  key={`service-window-${index}`}
                  type="button"
                  onClick={() => setServiceWindowStart(index)}
                  aria-label={`Show service group ${index + 1}`}
                  className={`
                    h-1 rounded-full transition-all
                    ${
                      index === serviceWindowStart
                        ? "w-6 bg-blue-400"
                        : "w-2.5 bg-white/20 hover:bg-white/40"
                    }
                  `}
                />
              ),
            )}
          </div>
        </div>
      </div>

      <div
        className={`
          absolute inset-x-0 bottom-0 z-10
          flex justify-center gap-2 pb-5 lg:hidden
        `}
      >
        {slides.map((item, index) => (
          <button
            key={`dot-${item.eyebrow}`}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`Show ${item.eyebrow}`}
            className={`
              h-1.5 rounded-full transition-all
              ${index === active ? "w-8 bg-blue-400" : "w-3 bg-white/40"}
            `}
          />
        ))}
      </div>
    </section>
  );
}
