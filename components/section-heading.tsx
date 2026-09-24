"use client";

import { motion } from "motion/react";
export function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return <div className="max-w-[52rem]">
    <p className="enterprise-kicker">
    {eyebrow}
  </p>
    <h2 className="enterprise-title mt-5">
      {title}
    </h2>
    {text
      &&<p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
      {text}
    </p>}
  </div>;
}
