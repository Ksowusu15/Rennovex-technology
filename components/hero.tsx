"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Palette,
  Play,
  UsersRound,
} from "lucide-react";
import { motion } from "motion/react";

const capabilities = [
  {
    icon: Code2,
    label: "Software Development",
  },
  {
    icon: Palette,
    label: "Graphic Design",
  },
  {
    icon: UsersRound,
    label: "IT Consulting",
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div
        className={`
  absolute inset-0
  bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,.16),transparent_34%)]
`}
      />

      <div
        className={`
  container-shell relative grid items-center gap-8 py-9 sm:gap-10 sm:py-12
  lg:min-h-[650px] lg:grid-cols-[.9fr_1.1fr] lg:py-14 xl:min-h-[720px]
  xl:py-16
`}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.65,
          }}
          className="relative z-10 max-w-2xl"
        >
          <p
            className="
              text-xs font-bold uppercase
              tracking-[.28em] text-blue-600
            "
          >
            Innovative &nbsp;•&nbsp; Creative &nbsp;•&nbsp; Reliable
          </p>

          <h1
            className={`
  mt-4 text-[2.45rem] font-extrabold leading-[1.02] tracking-[-.05em]
  text-[#071d49] min-[380px]:text-[2.75rem] sm:mt-5 sm:text-6xl
  lg:text-[3.75rem] xl:text-[4.75rem]
`}
          >
            Transforming Ideas Into
            {" "}
            <span className="text-blue-600">
              Real Solutions
            </span>
          </h1>

          <p
            className="
              mt-5 max-w-xl text-[15px] leading-7 text-slate-600
              sm:mt-6 sm:text-lg
            "
          >
            Rennovex delivers modern software development,
            creative design, and strategic IT consulting to help
            businesses grow, innovate, and stay ahead in a digital world.
          </p>

          <div
            className="
              mt-7 flex flex-col gap-3
              min-[460px]:flex-row
              sm:mt-8
            "
          >
            <Link
              href="/contact"
              className="brand-btn-primary"
            >
              Get Started
              
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/projects"
              className="brand-btn-secondary"
            >
              View Our Work
              
              <Play
                size={16}
                fill="currentColor"
              />
            </Link>
          </div>

          <div
            className="
              mt-8 grid gap-3
              min-[520px]:grid-cols-3
              sm:mt-9
            "
          >
            {capabilities.map(
              ({
                icon: Icon,
                label,
              }) => (
                <div
                  key={label}
                  className={`
  flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/90
  p-3 shadow-sm
`}
                >
                  <span
                    className={`
  grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50
  text-blue-600
`}
                  >
                    <Icon size={19} />
                  </span>

                  <span
                    className="
                      text-xs font-bold leading-4 text-[#071d49]
                    "
                  >
                    {label}
                  </span>
                </div>
              ),
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            x: 30,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.75,
            delay: 0.1,
          }}
          className={`
  relative min-h-[300px] overflow-hidden rounded-[1.5rem]
  min-[430px]:min-h-[360px] sm:min-h-[430px] sm:rounded-[2rem]
  lg:min-h-[560px] lg:rounded-none
`}
        >
          <Image
            src="/home-hero.jpg"
            alt="Rennovex technology professional"
            fill
            priority
            sizes="
              (max-width: 1024px) 100vw,
              55vw
            "
            className="object-cover object-top"
          />

          <div
            className={`
  absolute inset-0 bg-gradient-to-r from-white/20 via-transparent
  to-blue-950/10
`}
          />

          <div
            className={`
  absolute bottom-4 right-4 max-w-[160px] rounded-2xl border
  border-white/40 bg-[#061b46]/90 p-5 text-white shadow-2xl
  backdrop-blur-md sm:bottom-6 sm:right-6 sm:max-w-[180px]
`}
          >
            <p
              className="
                text-[10px] font-bold uppercase
                tracking-[.2em] text-blue-200
              "
            >
              Your vision
            </p>

            <p className="mt-2 text-xl font-bold leading-tight">
              Our expertise.
            </p>

            <p className="mt-3 text-xs leading-5 text-blue-100">
              A brighter digital tomorrow.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
