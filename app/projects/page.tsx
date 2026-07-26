import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Github } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/section-heading";
import { safePublicQuery } from "@/lib/db-resilience";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const projects = await safePublicQuery(() => prisma.project.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" } }), [], "public-projects");
  return (
    <section className="section-space"><div className="container-shell"><SectionHeading eyebrow="Projects" title="Selected projects, products, and digital experiences." text="A growing collection of work across software, web, design, and business technology."/>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map(project => <article key={project.id} className="glass overflow-hidden rounded-2xl">
          {project.image && <div className="relative aspect-[4/3]"><Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover"/></div>}
          <div className="p-6"><h2 className="text-xl font-bold">{project.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p><div className="mt-5 flex flex-wrap gap-2">{project.technologies.map(t => <span key={t} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">{t}</span>)}</div><div className="mt-6 flex gap-4 text-sm">{project.demoUrl && <Link href={project.demoUrl} className="flex items-center gap-2 text-sky-700">Live demo <ExternalLink size={15}/></Link>}{project.githubUrl && <Link href={project.githubUrl} className="flex items-center gap-2 text-slate-700">GitHub <Github size={15}/></Link>}</div></div>
        </article>)}
      </div>
    </div></section>
  );
}
