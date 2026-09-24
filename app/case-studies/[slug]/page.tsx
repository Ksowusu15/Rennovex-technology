import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await prisma.caseStudy.findUnique({ where: { slug } });
  if (!study 
    || study.status !== "PUBLISHED") notFound();
  const sections = [["The challenge", 
    study.challenge], 
    ["Our solution", 
    study.solution], 
    ["Development process", 
    study.process], 
    ["Results achieved", 
    study.results]];
  return <article className="section-space">
    <div className="container-shell">
    <p className="eyebrow">Case study</p>
    <h1 className="display-title mt-5 max-w-4xl">
      {study.title}
    </h1>
    <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">
      {study.overview}
    </p>
    {study.images[0] && <div className="relative mt-12 aspect-[16/8] overflow-hidden rounded-3xl border border-slate-200">
      <Image 
      src={study.images[0]} 
      alt={study.title} 
      fill 
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
      className="object-cover"/>
    </div>}
    <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_280px]">
      <div className="grid gap-8">
      {sections.map(([title, text]) => <section 
      key={title} 
      className="glass rounded-2xl p-7">
      <h2 className="text-2xl font-bold">
        {title}
      </h2>
      <p className="mt-4 leading-8 text-slate-700">
        {text}
      </p>
    </section>)}
    </div>
      <aside className="glass h-fit rounded-2xl p-6">
        <h2 className="font-bold">Technology</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {study.technologies.map(t => <span 
      key={t} 
      className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
        {t}
      </span>)}
      </div>
      {study.projectUrl && <Link 
      href={study.projectUrl} 
      className="btn-secondary mt-6 w-full">Visit project 
      <ExternalLink size={15}/>
      </Link>}
      </aside>
    </div>
  </div>
  </article>;
}
