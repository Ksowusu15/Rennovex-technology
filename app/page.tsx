import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Hero } from "@/components/hero";
import { ServiceGrid } from "@/components/service-grid";
import { MotionItem, MotionReveal, MotionStagger } from "@/components/motion-reveal";
import { safePublicQuery } from "@/lib/db-resilience";

export default async function HomePage() {
  const [services, studies, projects, posts] = await Promise.all([
    safePublicQuery(() => prisma.service.findMany({ where: { status: "PUBLISHED" }, orderBy: { order: "asc" }, take: 5 }), [], "home-services"),
    safePublicQuery(() => prisma.caseStudy.findMany({ where: { status: "PUBLISHED", featured: true }, take: 1 }), [], "home-case-studies"),
    safePublicQuery(() => prisma.project.findMany({ where: { status: "PUBLISHED", featured: true }, take: 3 }), [], "home-projects"),
    safePublicQuery(() => prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, take: 3 }), [], "home-posts"),
  ]);
  const study = studies[0];

  return <>
    <Hero />

    <section className="border-b border-slate-200 bg-white py-7">
      <div className="container-shell flex flex-col gap-5 lg:flex-row xl:items-center lg:justify-between">
        <p className="text-sm font-semibold uppercase tracking-[.16em] text-slate-400">Capabilities trusted by growing organisations</p>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-slate-700"><span>Web platforms</span><span>Custom software</span><span>Product design</span><span>Cloud systems</span><span>Technology advisory</span></div>
      </div>
    </section>

    <section className="enterprise-section bg-white">
      <div className="container-shell">
        <MotionReveal className="grid gap-8 xl:grid-cols-[.75fr_1.25fr] xl:items-end">
          <div><p className="enterprise-kicker">Core services</p><h2 className="enterprise-title mt-5">Focused expertise for meaningful digital change.</h2></div>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 lg:justify-self-end">We bring strategy, design, and engineering together so your solution is useful today and maintainable tomorrow.</p>
        </MotionReveal>
        <ServiceGrid services={services}/>
      </div>
    </section>

    {study && <section className="enterprise-section bg-slate-950 text-white">
      <div className="container-shell grid gap-10 xl:grid-cols-[1.05fr_.95fr] xl:items-center xl:gap-16">
        <MotionReveal>
          <p className="enterprise-kicker !text-blue-300">Featured case study</p>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">{study.title}</h2>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">{study.overview}</p>
          <Link href={`/case-studies/${study.slug}`} className="mt-8 inline-flex items-center gap-2 font-semibold text-white hover:text-blue-300">Read the full story <ArrowRight size={17}/></Link>
        </MotionReveal>
        {study.images[0] && <MotionReveal className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-slate-900"><Image src={study.images[0]} alt={study.title} fill sizes="(max-width:1024px) 100vw,50vw" className="object-cover"/></MotionReveal>}
      </div>
    </section>}

    <section className="enterprise-section bg-[#f7f8fa]">
      <div className="container-shell grid gap-12 xl:grid-cols-[.72fr_1.28fr] xl:gap-20">
        <MotionReveal><p className="enterprise-kicker">How we work</p><h2 className="enterprise-title mt-5">A disciplined process. No unnecessary complexity.</h2><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Every engagement is structured around business context, clear decisions, and measurable delivery.</p></MotionReveal>
        <MotionStagger className="divide-y divide-slate-300 border-y border-slate-300">
          {[["01","Discover","We clarify the problem, audience, constraints, and success measures."],["02","Shape","We define the product direction, experience, technical plan, and delivery scope."],["03","Build","We engineer, test, and refine the solution with regular visibility."],["04","Launch & improve","We deploy carefully, document the system, and support its next stage."]].map(([num,title,text])=><MotionItem key={num}><div className="grid gap-3 py-7 sm:grid-cols-[52px_180px_1fr]"><span className="text-sm font-semibold text-blue-700">{num}</span><h3 className="text-lg font-semibold text-slate-950">{title}</h3><p className="leading-7 text-slate-600">{text}</p></div></MotionItem>)}
        </MotionStagger>
      </div>
    </section>

    {projects.length > 0 && <section className="enterprise-section bg-white">
      <div className="container-shell">
        <MotionReveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="enterprise-kicker">Selected work</p><h2 className="enterprise-title mt-5">Products designed to perform.</h2></div><Link href="/projects" className="inline-flex items-center gap-2 font-semibold text-blue-700">View projects <ArrowRight size={17}/></Link></MotionReveal>
        <MotionStagger className="mt-12 grid gap-7 xl:grid-cols-3">{projects.map(project=><MotionItem key={project.id}><Link href="/projects" className="group block"><div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">{project.image&&<Image src={project.image} alt={project.title} fill sizes="(max-width:1024px) 100vw,33vw" className="object-cover transition duration-700 group-hover:scale-[1.03]"/>}</div><h3 className="mt-5 text-xl font-semibold tracking-[-.02em] text-slate-950">{project.title}</h3><p className="mt-2 line-clamp-2 leading-7 text-slate-600">{project.description}</p></Link></MotionItem>)}</MotionStagger>
      </div>
    </section>}

    <section className="enterprise-section border-y border-slate-200 bg-[#f7f8fa]">
      <div className="container-shell grid gap-12 xl:grid-cols-2 xl:items-center xl:gap-20">
        <MotionReveal><Quote size={34} className="text-blue-700"/><blockquote className="mt-7 text-3xl font-medium leading-tight tracking-[-.035em] text-slate-950 sm:text-4xl">“Strong technology should simplify the business, not become another thing the business has to manage.”</blockquote><p className="mt-6 text-sm font-semibold uppercase tracking-[.15em] text-slate-500">The Rennovex delivery principle</p></MotionReveal>
        <MotionStagger className="grid gap-4 sm:grid-cols-2">{[["Business-first","Every decision starts with the outcome your organisation needs."],["Clear ownership","You know what is happening, who owns it, and what comes next."],["Reliable engineering","Security, performance, and maintainability are designed in."],["Long-term partnership","We remain available after launch as your priorities evolve."]].map(([title,text])=><MotionItem key={title}><div className="border-t border-slate-300 py-6"><CheckCircle2 size={19} className="text-blue-700"/><h3 className="mt-4 font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div></MotionItem>)}</MotionStagger>
      </div>
    </section>

    {posts.length > 0 && <section className="enterprise-section bg-white">
      <div className="container-shell">
        <MotionReveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="enterprise-kicker">Insights</p>
            <h2 className="enterprise-title mt-5">Thinking for better digital decisions.</h2>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-800">
            View all insights <ArrowRight size={17}/>
          </Link>
        </MotionReveal>

        <MotionStagger className="mt-12 grid gap-8 xl:grid-cols-3">
          {posts.map(post => <MotionItem key={post.id}>
            <Link href={`/blog/${post.slug}`} className="group block h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1279px) 100vw, 33vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-end p-6">
                    <span className="text-sm font-semibold uppercase tracking-[.16em] text-white/90">Rennovex Insight</span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[.14em] text-blue-700">Insight</p>
                  <time className="text-xs font-medium text-slate-500" dateTime={post.createdAt.toISOString()}>
                    {post.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </time>
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug tracking-[-.02em] text-slate-950 transition group-hover:text-blue-700">{post.title}</h3>
                <p className="mt-3 line-clamp-3 leading-7 text-slate-600">{post.excerpt}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                  Read insight <ArrowRight size={16} className="transition group-hover:translate-x-1"/>
                </span>
              </div>
            </Link>
          </MotionItem>)}
        </MotionStagger>
      </div>
    </section>}

    <section className="bg-blue-700 py-16 text-white sm:py-20"><div className="container-shell flex flex-col gap-8 lg:flex-row xl:items-center lg:justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-blue-200">Start a conversation</p><h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Let’s build the right solution for your next stage.</h2></div><Link href="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 font-semibold text-blue-700 hover:bg-blue-50">Discuss your project <ArrowRight size={17}/></Link></div></section>
  </>;
}
