"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { PricingService } from "@/lib/pricing-data";

function planAudience(
  planName: string,
) {
  if (
    planName === "Starter" ||
    planName === "Consultation"
  ) {
    return "Best for focused needs and smaller scopes";
  }

  if (
    planName === "Professional" ||
    planName === "Business IT Support"
  ) {
    return "Best for growing businesses that need more capability";
  }

  return "Best for advanced, scalable or custom requirements";
}

export function PricingPlanCards({
  group,
}: {
  group: PricingService;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {group.plans.map(
        (
          plan,
          index,
        ) => {
          const popular =
            Boolean(
              plan.popular,
            );

          return (
            <motion.article
              key={plan.name}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 24,
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
                amount: 0.12,
              }}
              transition={{
                duration: 0.45,
                delay:
                  index * 0.08,
              }}
              whileHover={
                reduceMotion
                  ? {}
                  : {
                      y: -6,
                    }
              }
              className={`
                group relative flex min-h-full flex-col
                overflow-hidden rounded-[1.75rem] border p-7
                transition-shadow duration-500 sm:p-8
                ${
                  popular
                    ? "border-blue-600 bg-blue-600 text-white shadow-[0_24px_70px_rgba(37,99,235,.25)]"
                    : "border-slate-200 bg-white text-slate-900 shadow-[0_14px_45px_rgba(15,23,42,.07)] hover:shadow-[0_28px_80px_rgba(15,23,42,.14)]"
                }
              `}
            >
              <span
                className={`
                  pointer-events-none absolute -right-20 -top-20
                  h-44 w-44 rounded-full bg-cyan-300/10 blur-3xl
                  transition duration-500 group-hover:scale-125
                `}
              />

              {popular && (
                <span
                  className={`
                    absolute left-1/2 top-3 z-20 -translate-x-1/2
                    whitespace-nowrap rounded-full border
                    border-cyan-200/70 bg-cyan-300 px-5 py-2
                    text-[11px] font-black uppercase tracking-[.14em]
                    text-slate-950 shadow-[0_8px_24px_rgba(34,211,238,.35)]
                    sm:text-xs
                  `}
                >
                  Most Popular
                </span>
              )}

              <h3
                className={`
                  text-2xl font-black
                  ${
                    popular
                      ? "pt-10"
                      : ""
                  }
                `}
              >
                {plan.name}
              </h3>

              <p
                className={`
                  mt-2 text-sm leading-6
                  ${
                    popular
                      ? "text-blue-100"
                      : "text-slate-500"
                  }
                `}
              >
                {planAudience(
                  plan.name,
                )}
              </p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-2xl font-bold">
                  GH₵
                </span>
                <span
                  className={`
                    text-5xl font-black tracking-[-.05em]
                  `}
                >
                  {plan.price}
                </span>
              </div>

              <p
                className={`
                  mt-2 text-sm
                  ${
                    popular
                      ? "text-blue-100"
                      : "text-slate-500"
                  }
                `}
              >
                starting project price
              </p>

              <ul className="mt-7 flex-1 space-y-4">
                {plan.features.map(
                  (feature) => (
                    <li
                      key={feature}
                      className={`
                        flex gap-3 text-sm leading-6
                        sm:text-[15px]
                      `}
                    >
                      <Check
                        size={18}
                        className={`
                          mt-0.5 shrink-0
                          ${
                            popular
                              ? "text-cyan-300"
                              : "text-blue-600"
                          }
                        `}
                      />
                      <span>
                        {feature}
                      </span>
                    </li>
                  ),
                )}
              </ul>

              <Link
                href={`/contact?service=${encodeURIComponent(
                  group.service,
                )}&package=${encodeURIComponent(
                  plan.name,
                )}`}
                className={`
                  mt-8 inline-flex items-center justify-center gap-2
                  rounded-xl px-5 py-3.5 text-sm font-extrabold
                  transition hover:-translate-y-0.5
                  ${
                    popular
                      ? "bg-white text-blue-700 hover:bg-blue-50"
                      : "bg-[#071d49] text-white hover:bg-blue-700"
                  }
                `}
              >
                Request This Package
                <ArrowRight size={17} />
              </Link>
            </motion.article>
          );
        },
      )}
    </div>
  );
}
