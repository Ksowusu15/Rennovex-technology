import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { safePublicQuery } from "@/lib/db-resilience";
import { MotionItem, MotionReveal, MotionStagger } from "@/components/motion-reveal";

export const metadata = {
  alternates: { canonical: "/case-studies" },
  title: "Case Studies",
  description:
    "Explore the challenges, thinking, solutions and outcomes behind selected Rennovex Technology projects.",
};

export default async function CaseStudiesPage() {
  const studies = await safePublicQuery(
    () =>
      prisma.caseStudy.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }),
    [],
    "case-studies-list",
  );

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/70 to-white">
        <div className="container-shell py-12 sm:py-16 lg:py-20">
          <MotionReveal className="grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="brand-kicker">Case Studies</p>
              <h1
                className={[
                  "mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.045em]",
                  "text-[#071d49] sm:text-5xl lg:text-6xl",
                ].join(" ")}
              >
                The thinking behind <span className="text-blue-600">the work.</span>
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base lg:justify-self-end">
              Go beyond the screenshots. See the problems we tackled, how we
              approached them and the solutions we delivered.
            </p>
          </MotionReveal>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container-shell">
          {studies.length > 0 ? (
            <MotionStagger className="grid gap-6 lg:grid-cols-2">
              {studies.map((study) => (
                <MotionItem key={study.id} className="h-full">
                  <Link
                    href={`/case-studies/${study.slug}`}
                    className={[
                      "group flex h-full flex-col overflow-hidden rounded-[1.6rem] border",
                      "border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,.07)]",
                      "transition duration-300 hover:-translate-y-1 hover:border-blue-200",
                      "hover:shadow-[0_22px_55px_rgba(15,23,42,.12)]",
                    ].join(" ")}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#071d49] to-blue-700">
                      {study.images[0] ? (
                        <Image
                          src={study.images[0]}
                          alt={study.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-contain transition duration-500 group-hover:scale-[1.015]"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-white/40">
                          <BriefcaseBusiness size={52} />
                        </div>
                      )}
                      {study.featured && (
                        <span
                          className={[
                            "absolute left-4 top-4 rounded-full border border-white/25",
                            "bg-[#071d49]/75 px-3 py-1.5 text-[10px] font-extrabold uppercase",
                            "tracking-[.14em] text-white backdrop-blur",
                          ].join(" ")}
                        >
                          Featured case study
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6 sm:p-7">
                      <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-[#071d49]">
                        {study.title}
                      </h2>
                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                        {study.overview}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {study.technologies.slice(0, 4).map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-700"
                          >
                            {technology}
                          </span>
                        ))}
                      </div>
                      <span
                        className={[
                          "mt-auto inline-flex items-center gap-2 border-t border-slate-100",
                          "pt-5 text-sm font-extrabold text-blue-700 transition",
                          "group-hover:gap-3",
                        ].join(" ")}
                      >
                        Read the case study
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </Link>
                </MotionItem>
              ))}
            </MotionStagger>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <h2 className="text-xl font-bold text-[#071d49]">
                Case studies are being prepared.
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-600">
                In the meantime, explore our published projects and see what Rennovex
                has been building.
              </p>
              <Link href="/projects" className="btn-primary mt-6">
                Explore projects
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
