import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  Github,
  Layers3,
} from "lucide-react";

import { safePublicQuery } from "@/lib/db-resilience";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Projects",
  description:
    "Explore selected software, web, design, and business technology projects by Rennovex Technology.",
};

export default async function ProjectsPage() {
  const projects = await safePublicQuery(
    () =>
      prisma.project.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      }),
    [],
    "public-projects",
  );

  return (
    <>
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/70 to-white">
        <div className="container-shell py-12 sm:py-16 lg:py-20">
          <div className="grid gap-8 lg:grid-cols-[1fr_.65fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="brand-kicker">Our Work</p>

              <h1 className="mt-4 text-4xl font-extrabold leading-[1.02] tracking-[-0.045em] text-[#071d49] sm:text-5xl lg:text-6xl">
                Projects built to create{" "}
                <span className="text-blue-600">real impact.</span>
              </h1>
            </div>

            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base lg:justify-self-end">
              Explore selected software, web, design, and business technology
              solutions created to solve practical problems and support growth.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 sm:py-14 lg:py-16">
        <div className="container-shell">
          {projects.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_55px_rgba(15,23,42,0.12)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#061b46] via-blue-800 to-blue-500">
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 1023px) 100vw, (max-width: 1535px) 50vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.035]"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="grid h-20 w-20 place-items-center rounded-3xl border border-white/20 bg-white/10 text-white backdrop-blur">
                          <Code2 size={34} />
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#041d49]/55 via-transparent to-transparent" />

                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-blue-700 shadow-sm backdrop-blur">
                      <Layers3 size={12} />
                      Project
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-bold leading-tight tracking-[-0.02em] text-[#071d49] sm:text-[1.35rem]">
                        {project.title}
                      </h2>

                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <ArrowUpRight size={17} />
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {project.description}
                    </p>

                    {project.technologies.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.technologies.slice(0, 5).map((technology) => (
                          <span
                            key={technology}
                            className="rounded-full border border-blue-100 bg-blue-50/60 px-3 py-1.5 text-[11px] font-semibold text-blue-700"
                          >
                            {technology}
                          </span>
                        ))}

                        {project.technologies.length > 5 && (
                          <span className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                            +{project.technologies.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-slate-100 pt-5 text-sm font-bold">
                      {project.demoUrl && (
                        <Link
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 transition hover:text-blue-800"
                        >
                          Live project
                          <ExternalLink size={15} />
                        </Link>
                      )}

                      {project.githubUrl && (
                        <Link
                          href={project.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-slate-600 transition hover:text-slate-950"
                        >
                          GitHub
                          <Github size={15} />
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                <Layers3 size={25} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-[#071d49]">
                Projects are being prepared
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Published Rennovex projects will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
