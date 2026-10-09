"use client";

import { WhatsAppLink } from "@/components/whatsapp-link";
import Link from "next/link";
import { PricingPlanCards } from "@/components/pricing-plan-cards";
import {
  ArrowRight,
  Code2,
  HelpCircle,
  Palette,
  ServerCog,
} from "lucide-react";
import {
  motion,
  useReducedMotion,
} from "motion/react";

import type {
  PricingService,
} from "@/lib/pricing-data";

export const pricingCategories = [
  {
    title: "Web & Software Development",
    description:
      "Websites, e-commerce stores and custom software built around your business.",
    href: "/pricing/web-software",
    icon: Code2,
  },
  {
    title: "Graphic Design & Branding",
    description:
      "Brand identity and professional creative assets for a consistent business presence.",
    href: "/pricing/branding",
    icon: Palette,
  },
  {
    title: "IT Solutions & Consulting",
    description:
      "Technology guidance, implementation support and practical business IT solutions.",
    href: "/pricing/it-solutions",
    icon: ServerCog,
  },
] as const;

type PricingCategoryProps = {
  eyebrow: string;
  title: string;
  description: string;
  services: readonly PricingService[];
  currentHref?: string;
  showExplore?: boolean;
};

export function PricingCategory({
  eyebrow,
  title,
  description,
  services,
  currentHref,
  showExplore = true,
}: PricingCategoryProps) {
  const reduceMotion =
    useReducedMotion();

  const enter = reduceMotion
    ? {}
    : {
        initial: {
          opacity: 0,
          y: 24,
        },
        whileInView: {
          opacity: 1,
          y: 0,
        },
        viewport: {
          once: true,
          amount: 0.12,
        },
        transition: {
          duration: 0.55,
        },
      };

  return (
    <main className="bg-white">
      <section
        className={`
          relative overflow-hidden border-b border-blue-900/20
          bg-[#061b46] py-16 text-white sm:py-20 lg:py-24
        `}
      >
        <div
          className={`
            absolute -right-24 -top-24 h-72 w-72 rounded-full
            bg-blue-500/20 blur-3xl
          `}
        />

        <motion.div
          {...enter}
          className="container-shell relative text-center"
        >
          <p
            className={`
              text-xs font-extrabold uppercase tracking-[.24em]
              text-cyan-300
            `}
          >
            {eyebrow}
          </p>

          <h1
            className={`
              mx-auto mt-4 max-w-4xl text-4xl font-black
              tracking-[-.045em] sm:text-5xl lg:text-6xl
            `}
          >
            {title}
          </h1>

          <p
            className={`
              mx-auto mt-5 max-w-2xl text-base leading-7
              text-blue-100 sm:text-lg
            `}
          >
            {description}
          </p>
        </motion.div>
      </section>

      <div className="container-shell py-14 sm:py-18 lg:py-20">
        <div className="space-y-20 lg:space-y-24">
          {services.map(
            (
              group,
              groupIndex,
            ) => (
              <motion.section
                key={group.service}
                id={group.slug}
                className="scroll-mt-28"
                {...enter}
                transition={{
                  duration: 0.55,
                  delay: Math.min(
                    groupIndex * 0.06,
                    0.18,
                  ),
                }}
              >
                <div className="mb-8 max-w-2xl sm:mb-9">
                  <p
                    className={`
                      text-xs font-extrabold uppercase tracking-[.22em]
                      text-blue-600
                    `}
                  >
                    Rennovex package pricing
                  </p>

                  <h2
                    className={`
                      mt-3 text-3xl font-black tracking-[-.035em]
                      text-[#071d49] sm:text-4xl
                    `}
                  >
                    {group.service}
                  </h2>

                  <p className="mt-3 leading-7 text-slate-600">
                    {group.description}
                  </p>
                </div>

                <PricingPlanCards group={group} />
              </motion.section>
            ),
          )}
        </div>

        {showExplore && (
          <motion.section
            {...enter}
            className="mt-20 border-t border-slate-200 pt-14 lg:mt-24 lg:pt-16"
          >
            <div className="max-w-2xl">
              <p
                className={`
                  text-xs font-extrabold uppercase tracking-[.22em]
                  text-blue-600
                `}
              >
                See more
              </p>
              <h2
                className={`
                  mt-3 text-3xl font-black tracking-[-.035em]
                  text-[#071d49] sm:text-4xl
                `}
              >
                Explore other packages
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                Need something different? Choose another Rennovex package
                category and go directly to its pricing.
              </p>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {pricingCategories
                .filter(
                  (item) =>
                    item.href !==
                    currentHref,
                )
                .map(
                  (
                    item,
                    index,
                  ) => {
                    const Icon =
                      item.icon;

                    return (
                      <motion.div
                        key={item.href}
                        initial={
                          reduceMotion
                            ? false
                            : {
                                opacity: 0,
                                y: 18,
                              }
                        }
                        whileInView={
                          reduceMotion
                            ? {}
                            : {
                                opacity: 1,
                                y: 0,
                              }
                        }
                        viewport={{
                          once: true,
                        }}
                        transition={{
                          duration: 0.4,
                          delay:
                            index * 0.08,
                        }}
                      >
                        <Link
                          href={item.href}
                          className={`
                            group flex h-full flex-col rounded-[1.5rem]
                            border border-slate-200 bg-slate-50 p-6 shadow-sm
                            transition duration-300 hover:-translate-y-1
                            hover:border-blue-200 hover:bg-white
                            hover:shadow-[0_18px_50px_rgba(15,23,42,.10)]
                            sm:p-7
                          `}
                        >
                          <span
                            className={`
                              grid h-12 w-12 place-items-center rounded-xl
                              bg-blue-100 text-blue-700 transition
                              group-hover:bg-blue-600 group-hover:text-white
                            `}
                          >
                            <Icon size={22} />
                          </span>

                          <h3
                            className={`
                              mt-5 text-xl font-black text-[#071d49]
                            `}
                          >
                            {item.title}
                          </h3>

                          <p
                            className={`
                              mt-2 flex-1 text-sm leading-6 text-slate-600
                            `}
                          >
                            {item.description}
                          </p>

                          <span
                            className={`
                              mt-5 inline-flex items-center gap-2 text-sm
                              font-extrabold text-blue-700
                            `}
                          >
                            See Pricing
                            <ArrowRight
                              size={16}
                              className={`
                                transition-transform group-hover:translate-x-1
                              `}
                            />
                          </span>
                        </Link>
                      </motion.div>
                    );
                  },
                )}
            </div>

            <Link
              href="/pricing"
              className={`
                mt-7 inline-flex items-center gap-2 text-sm font-extrabold
                text-slate-700 transition hover:text-blue-700
              `}
            >
              View all pricing
              <ArrowRight size={16} />
            </Link>
          </motion.section>
        )}

        <section
          className={`
            mt-16 rounded-[2rem] bg-slate-50 px-6 py-10 text-center
            sm:px-10 sm:py-12 lg:mt-20
          `}
        >
          <HelpCircle
            size={26}
            className="mx-auto text-blue-600"
          />
          <h2
            className={`
              mt-4 text-3xl font-black tracking-[-.035em] text-[#071d49]
            `}
          >
            Not sure which package fits?
          </h2>
          <p
            className={`
              mx-auto mt-3 max-w-2xl leading-7 text-slate-600
            `}
          >
            Every project is different. Tell us what you are building or book
            a consultation and we will recommend the right scope.
          </p>

          <div
            className={`
              mt-7 flex flex-col justify-center gap-3 sm:flex-row
            `}
          >
            <Link
              href="/contact"
              className="brand-btn-primary"
            >
              Request a Custom Quote
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/book-consultation"
              className="brand-btn-secondary"
            >
              Book a Consultation
            </Link>
            <WhatsAppLink
              message="Hello Rennovex Technology, I would like help choosing a project package."
            />
          </div>
        </section>
      </div>
    </main>
  );
}
