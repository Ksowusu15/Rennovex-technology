import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Layers3,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { safePublicQuery } from "@/lib/db-resilience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await safePublicQuery(
    () => prisma.caseStudy.findUnique({ where: { slug } }),
    null,
    `case-study-metadata-${slug}`,
  );

  if (!study || study.status !== "PUBLISHED") {
    return { title: "Case Study" };
  }

  return {
    title: study.title,
    description: study.overview,
    alternates: { canonical: `/case-studies/${encodeURIComponent(slug)}` },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await safePublicQuery(
    () => prisma.caseStudy.findUnique({ where: { slug } }),
    null,
    `case-study-${slug}`,
  );

  if (!study || study.status !== "PUBLISHED") {
    notFound();
  }

  const sections = [
    {
      label: "01",
      title: "The challenge",
      text: study.challenge,
    },
    {
      label: "02",
      title: "Our solution",
      text: study.solution,
    },
    {
      label: "03",
      title: "How we approached it",
      text: study.process,
    },
    {
      label: "04",
      title: "The outcome",
      text: study.results,
    },
  ];

  return (
    <article className="bg-white">
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/70 to-white">
        <div className="container-shell py-12 sm:py-16 lg:py-20">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:gap-3"
          >
            <ArrowLeft size={16} />
            All case studies
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_.55fr] lg:items-end">
            <div className="max-w-4xl">
              <p className="brand-kicker">Rennovex case study</p>
              <h1
                className={[
                  "mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.045em]",
                  "text-[#071d49] sm:text-5xl lg:text-6xl",
                ].join(" ")}
              >
                {study.title}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
                {study.overview}
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-[#071d49]">
                <Layers3 size={17} className="text-blue-600" />
                Technology used
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {study.technologies.map((technology) => (
                  <span
                    key={technology}
                    className={[
                      "rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs",
                      "font-semibold text-blue-700",
                    ].join(" ")}
                  >
                    {technology}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {study.images[0] && (
        <section className="container-shell pt-10 sm:pt-14">
          <div
            className={[
              "relative aspect-[16/8] overflow-hidden rounded-[1.75rem] border",
              "border-slate-200 bg-slate-100",
              "shadow-[0_20px_60px_rgba(15,23,42,.10)]",
            ].join(" ")}
          >
            <Image
              src={study.images[0]}
              alt={`${study.title} project preview`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-contain"
            />
          </div>
        </section>
      )}

      <section className="container-shell py-12 sm:py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {sections.map((section) => (
            <section
              key={section.title}
              className={[
                "rounded-[1.5rem] border border-slate-200 bg-white p-6",
                "shadow-[0_12px_35px_rgba(15,23,42,.05)] sm:p-8",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span
                  className={[
                    "grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-xs",
                    "font-extrabold text-blue-700",
                  ].join(" ")}
                >
                  {section.label}
                </span>
                <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[#071d49] sm:text-2xl">
                  {section.title}
                </h2>
              </div>
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {section.text}
              </p>
            </section>
          ))}
        </div>

        {study.images.length > 1 && (
          <div className="mt-14">
            <div className="max-w-2xl">
              <p className="brand-kicker">Project gallery</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-[#071d49]">
                A closer look at the solution.
              </h2>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {study.images.slice(1).map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                >
                  <Image
                    src={image}
                    alt={`${study.title} screenshot ${index + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={[
            "mt-14 grid gap-5 rounded-[1.75rem] bg-[#071d49] p-7 text-white",
            "sm:p-9 lg:grid-cols-[1fr_auto] lg:items-center",
          ].join(" ")}
        >
          <div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles size={17} />
              <span className="text-xs font-extrabold uppercase tracking-[.16em]">
                Build with Rennovex
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">
              Have a similar project in mind?
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100">
              Tell us what you are trying to build. We will help you shape the right
              approach, scope and next steps.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {study.projectUrl && (
              <Link
                href={study.projectUrl}
                target="_blank"
                rel="noreferrer"
                className={[
                  "inline-flex items-center gap-2 rounded-xl border border-white/25",
                  "px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10",
                ].join(" ")}
              >
                Visit project
                <ExternalLink size={16} />
              </Link>
            )}
            <Link
              href={`/contact?message=${encodeURIComponent(`Hello Rennovex, I would like to discuss a project similar to ${study.title}.`)}`}
              className={[
                "inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm",
                "font-extrabold text-[#071d49] transition hover:bg-blue-50",
              ].join(" ")}
            >
              Start a similar project
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
