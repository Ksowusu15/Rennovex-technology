"use client";

import Link from "next/link";
import { ArrowRight, Check, Code2, Compass, Layers3 } from "lucide-react";
import { motion } from "motion/react";

const capabilities = [
  { icon: Compass, label: "Strategy", text: "Clear digital direction tied to business goals." },
  { icon: Layers3, label: "Design", text: "Focused user experiences and scalable visual systems." },
  { icon: Code2, label: "Engineering", text: "Reliable websites and software built for growth." },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f8fa]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(37,99,235,0.10),transparent_32%)]" />
      <div className="container-shell relative grid items-center gap-10 py-12 sm:gap-12 sm:py-16 xl:min-h-[700px] xl:grid-cols-[1.08fr_.92fr] xl:gap-16 xl:py-20 2xl:gap-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65 }} className="max-w-3xl">
          <p className="enterprise-kicker">Rennovex Technology</p>
          <h1 className="mt-6 max-w-4xl text-[2.45rem] font-semibold leading-[1.02] tracking-[-0.055em] text-slate-950 sm:text-5xl lg:text-6xl xl:text-[4.4rem]">
            Technology built around how your business actually works.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            We design and engineer websites, software, and digital systems that help ambitious organisations operate better, serve customers clearly, and grow with confidence.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="enterprise-btn-primary">Discuss your project <ArrowRight size={17}/></Link>
            <Link href="/case-studies" className="enterprise-btn-secondary">View selected work</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-slate-300 pt-6 text-sm font-medium text-slate-600">
            {["Business-first delivery", "Clear communication", "Long-term support"].map(item => <span key={item} className="inline-flex items-center gap-2"><Check size={15} className="text-blue-700"/>{item}</span>)}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7, delay: .12 }} className="relative mx-auto w-full max-w-3xl xl:max-w-none">
          <div className="absolute -inset-10 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="relative overflow-hidden rounded-[1.4rem] border border-slate-300 bg-white shadow-[0_32px_80px_-36px_rgba(15,23,42,.35)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/><span className="h-2.5 w-2.5 rounded-full bg-slate-300"/></div>
              <span className="text-xs font-semibold uppercase tracking-[.14em] text-slate-400">Delivery system</span>
            </div>
            <div className="bg-slate-950 p-6 text-white sm:p-8">
              <p className="text-sm font-semibold text-blue-300">From challenge to working product</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">One capable team. One clear process.</h2>
              <p className="mt-4 max-w-md leading-7 text-slate-400">Strategy, design, engineering, and support stay connected from the first conversation through launch.</p>
            </div>
            <div className="grid divide-y divide-slate-200 bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {capabilities.map(({ icon: Icon, label, text }) => <div key={label} className="p-5 sm:p-6"><Icon size={20} className="text-blue-700"/><h3 className="mt-5 font-semibold text-slate-950">{label}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p></div>)}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
