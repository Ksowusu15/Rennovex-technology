"use client";

import { motion } from "motion/react";
import { Activity, 
  CheckCircle2, 
  Code2, 
  Database, 
  Globe2, 
  ShieldCheck, 
  Sparkles, 
  Zap } from "lucide-react";

const bars = [44, 
  68, 
  53, 
  82, 
  72, 
  91, 
  78];
const code = [
  "const solution = await rennovex.build({",
  "  strategy: 'business-first',",
  "  experience: 'responsive',",
  "  platform: 'scalable',",
  "});",
];

export function TechnologyShowcase() {
  return (
    <section className="section-space overflow-hidden border-y border-slate-200 bg-slate-950 text-white">
      <div className="container-shell grid gap-12 xl:grid-cols-[.82fr_1.18fr] xl:items-center">
        <motion.div
          initial={{ opacity: 0, 
            x: -34 }}
          whileInView={{ opacity: 1, 
            x: 0 }}
          viewport={{ once: true, 
            amount: 0.25 }}
          transition={{ duration: 0.8, 
            ease: [0.22, 
            1, 
            0.36, 
            1] }}
        >
          <div className={`
  inline-flex items-center gap-2 rounded-full border border-blue-400/20
  bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[.18em]
  text-blue-300
`}>
            <Sparkles size={14} /> 
            Live technology showcase
          </div>
          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">See how we turn ideas into dependable digital systems.</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Our process connects product thinking, interface design, secure engineering, data, and performance into one clear delivery system.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, 
                label: "Secure by design" },
              { icon: Zap, 
                label: "Performance focused" },
              { icon: Globe2, 
                label: "Responsive everywhere" },
              { icon: Database, 
                label: "Scalable architecture" },
            ].map(({ icon: Icon, label }, 
              index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, 
                  y: 14 }}
                whileInView={{ opacity: 1, 
                  y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12 + index * 0.08 }}
                className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3"
              >
                <Icon 
                  className="text-blue-300" 
                  size={18} />
                <span className="text-sm font-semibold text-slate-200">
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, 
            y: 38, 
            scale: 0.97 }}
          whileInView={{ opacity: 1, 
            y: 0, 
            scale: 1 }}
          viewport={{ once: true, 
            amount: 0.18 }}
          transition={{ duration: 0.85, 
            delay: 0.08, 
            ease: [0.22, 
            1, 
            0.36, 
            1] }}
          className="relative"
        >
          <motion.div
            aria-hidden="true"
            animate={{ opacity: [0.35, 
              0.65, 
              0.35], 
              scale: [1, 
              1.04, 
              1] }}
            transition={{ duration: 5, 
              repeat: Infinity, 
              ease: "easeInOut" }}
            className="absolute -inset-6 rounded-[2.5rem] bg-blue-500/20 blur-3xl"
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-700 bg-slate-900 shadow-2xl shadow-blue-950/40">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <div className="flex gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400"/>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300"/>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"/>
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400"/> 
                Systems operational</div>
            </div>

            <div className="grid gap-px bg-slate-800 md:grid-cols-[1.05fr_.95fr]">
              <div className="bg-slate-950 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-200">Delivery performance</p>
                  <Activity 
                  size={17} 
                  className="text-blue-300"/>
                </div>
                <div className="mt-6 flex h-44 items-end gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  {bars.map((height, 
                    index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0, 
                        opacity: 0.25 }}
                      whileInView={{ height: `${height}%`, 
                        opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.75, 
                        delay: 0.2 + index * 0.08, 
                        ease: [0.22, 
                        1, 
                        0.36, 
                        1] }}
                      className="relative flex-1 rounded-t-md bg-gradient-to-t from-blue-700 to-cyan-300"
                    >
                      <motion.span 
                        animate={{ opacity: [0.35, 
                        1, 
                        0.35] }} 
                        transition={{ duration: 2.2, 
                        delay: index * .12, 
                        repeat: Infinity }} 
                        className="absolute inset-x-0 top-0 h-px bg-white"/>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[['99.9%',
                    'Reliability'],
                    ['42%',
                    'Faster delivery'],
                    ['100',
                    'Quality checks']].map(([value,label]) => <div 
                    key={label} 
                    className="rounded-lg bg-slate-900 px-2 py-3">
                      <p className="font-bold text-white">
                      {value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                      {label}
                    </p>
                    </div>)}
                </div>
              </div>

              <div className="bg-slate-900 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Code2 
                  size={17} 
                  className="text-blue-300"/> 
                  product-engine.ts</div>
                <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-xs leading-7 text-slate-300 sm:text-sm">
                  {code.map((line, 
                    index) => (
                    <motion.div 
                      key={line} 
                      initial={{ opacity: 0, 
                      x: -12 }} 
                      whileInView={{ opacity: 1, 
                      x: 0 }} 
                      viewport={{ once: true }} 
                      transition={{ delay: 0.35 + index * 0.12 }}>
                      <span className="mr-3 select-none text-slate-700">
                        {String(index + 1).padStart(2, 
                        '0')}
                      </span>
                      <span className={index === 0 
                        || index === 4 
                        ? 'text-blue-300' 
                        : 'text-emerald-300'}>
                        {line}
                      </span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {['Architecture validated',
                    'Responsive UI complete',
                    'Production checks passed'].map((item,
                    index)=><motion.div 
                    key={item} 
                    initial={{opacity:0,
                    x:14}} 
                    whileInView={{opacity:1,
                    x:0}} 
                    viewport={{once:true}} 
                    transition={{delay:.65+index*.1}} 
                    className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300">
                      <CheckCircle2 
                    size={16} 
                    className="text-emerald-400"/>
                    {item}
                    </motion.div>)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
