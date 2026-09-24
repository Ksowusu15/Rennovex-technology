import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, 
  CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service 
    || service.status !== "PUBLISHED") notFound();
  return (
    <section className="section-space">
      <div className="container-shell">
        <p className="eyebrow">Service</p>
        <h1 className="display-title mt-5 max-w-4xl">
          {service.title}
        </h1>
        <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-600">
          {service.description}
        </p>
        <div className="mt-14 grid gap-8 xl:grid-cols-2">
          <div className="glass rounded-3xl p-7">
            <h2 className="text-2xl font-bold">Business benefits</h2>
            <div className="mt-6 grid gap-4">
              {service.benefits.map(item => <div 
            key={item} 
            className="flex gap-3">
              <CheckCircle2 
            className="mt-0.5 text-sky-700" 
            size={19}/>
            <span className="text-slate-700">
              {item}
            </span>
            </div>)}
            </div>
          </div>
          <div className="glass rounded-3xl p-7">
            <h2 className="text-2xl font-bold">Technology and methods</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {service.technologies.map(item => <span 
            key={item} 
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
              {item}
            </span>)}
            </div>
          </div>
        </div>
        <div className="mt-12">
          <Link 
          href="/contact" 
          className="btn-primary">Discuss this service 
          <ArrowRight size={16}/>
        </Link>
        </div>
      </div>
    </section>
  );
}
