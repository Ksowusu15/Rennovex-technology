import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/section-heading";
import { safePublicQuery } from "@/lib/db-resilience";

export const metadata = { title: "Case Studies" };

export default async function CaseStudiesPage() {
  const studies = await safePublicQuery(() => prisma.caseStudy.findMany({ where: { status: "PUBLISHED" }, 
    orderBy: { createdAt: "desc" } }), 
    [], 
    "case-studies-list");
  return <section className="section-space">
    <div className="container-shell">
    <SectionHeading 
    eyebrow="Case studies" 
    title="The thinking, process, and results behind the work."/>
    <div className="mt-12 grid gap-6 lg:grid-cols-2">
      {studies.map(study => <Link 
      key={study.id} 
      href={`/case-studies/${study.slug}`} 
      className="glass card-hover overflow-hidden rounded-3xl">
      {study.images[0] && <div className="relative aspect-[16/9]">
        <Image 
      src={study.images[0]} 
      alt={study.title} 
      fill 
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
      className="object-cover"/>
      </div>}
      <div className="p-7">
        <h2 className="text-2xl font-bold">
        {study.title}
      </h2>
      <p className="mt-3 leading-7 text-slate-600">
        {study.overview}
      </p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-700">View case study 
      <ArrowRight size={16}/>
      </span>
      </div>
    </Link>)}
    </div>
  </div>
  </section>;
}
