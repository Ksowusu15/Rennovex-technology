import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Code2,
  Lightbulb,
  Palette,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Hero } from "@/components/hero";
import { MotionItem, MotionReveal, MotionStagger } from "@/components/motion-reveal";
import { prisma } from "@/lib/prisma";
import { safePublicQuery } from "@/lib/db-resilience";

const serviceFallbacks = [
  {
    title: "Software Development",
    summary:
      "Custom web and mobile applications, business systems, APIs and automation built for your needs.",
    slug: "software-development",
    icon: Code2,
    image: "/images/services/software-development.svg",
    imageAlt: "Modern software development workspace with code on screen",
  },
  {
    title: "Graphic Design",
    summary:
      "Brand identities, marketing graphics, digital content and visual systems that make your brand stand out.",
    slug: "graphic-design",
    icon: Palette,
    image: "/images/services/graphic-design.svg",
    imageAlt: "Creative graphic design and branding workspace",
  },
  {
    title: "IT Consulting",
    summary:
      "Technology strategy, infrastructure guidance, system optimisation and ongoing IT support.",
    slug: "it-consulting",
    icon: UsersRound,
    image: "/images/services/it-consulting.svg",
    imageAlt: "Professional technology consulting meeting",
  },
];

const process = [
  ["01", "Discover", "Understand your needs and goals.", Search],
  ["02", "Plan", "Create a strategy and project roadmap.", Lightbulb],
  ["03", "Design", "Bring ideas to life with thoughtful experiences.", Palette],
  ["04", "Develop", "Build, test and refine the solution.", Code2],
  ["05", "Launch", "Deploy and provide ongoing support.", Rocket],
] as const;

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [services, projects, testimonials, caseStudies] = await Promise.all([
    safePublicQuery(
      () =>
        prisma.service.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { order: "asc" },
        }),
      [],
      "home-services",
    ),
    safePublicQuery(
      () =>
        prisma.project.findMany({
          where: { status: "PUBLISHED", featured: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        }),
      [],
      "home-projects",
    ),
    safePublicQuery(
      () =>
        prisma.testimonial.findMany({
          where: { status: "PUBLISHED" },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        }),
      [],
      "home-testimonials",
    ),
    safePublicQuery(
      () =>
        prisma.caseStudy.findMany({
          where: { status: "PUBLISHED" },
          select: { slug: true },
        }),
      [],
      "home-case-studies",
    ),
  ]);

  const caseStudySlugs = new Set(caseStudies.map((study) => study.slug));

  const displayedServices =
    services.length > 0
      ? services.map((service, index) => {
          const fallback = serviceFallbacks[index % serviceFallbacks.length];

          return {
            title: service.title,
            summary: service.summary,
            slug: service.slug,
            icon: fallback.icon,
            image: service.imageUrl || fallback.image,
            imageAlt: service.title,
          };
        })
      : serviceFallbacks;

  return (
    <>
      <Hero />

      <section className="relative overflow-hidden border-y border-slate-100 bg-[#f8fbff] py-10 sm:py-12 lg:py-14">
        <div className="container-shell">
          <MotionReveal>
            <div className="mx-auto max-w-2xl text-center">
              <div
                className={[
                  "inline-flex items-center gap-2 rounded-full border border-blue-100",
                  "bg-white px-4 py-2 shadow-sm",
                ].join(" ")}
              >
                <Sparkles size={14} className="text-blue-600" />
                <span className="text-[10px] font-extrabold uppercase tracking-[.24em] text-blue-700">
                  Organizations & Businesses We’ve Worked With
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-500 sm:text-base">
                Building thoughtful digital experiences and technology solutions
                across organizations, emerging brands and growing businesses.
              </p>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.12}>
            <div className="trust-marquee mx-auto mt-7 max-w-5xl">
              <div className="trust-marquee-track py-2">
                {[
                  {
                    name: "Soadwa Company Ltd",
                    image: "/images/clients/soadwa-company.jpeg",
                    imageClassName: "max-h-11",
                  },
                  {
                    name: "RebajaNow Services Ltd",
                    image: "/images/clients/rebajanow-services.png",
                    imageClassName: "max-h-8",
                  },
                  {
                    name: "CNK Establishment",
                    image: "/images/clients/cnk-establishment.jpeg",
                    imageClassName: "max-h-11",
                  },
                  {
                    name: "NEIP",
                    image: "/images/clients/neip.png",
                    imageClassName: "max-h-11",
                  },
                  {
                    name: "Soadwa Company Ltd",
                    image: "/images/clients/soadwa-company.jpeg",
                    imageClassName: "max-h-11",
                  },
                  {
                    name: "RebajaNow Services Ltd",
                    image: "/images/clients/rebajanow-services.png",
                    imageClassName: "max-h-8",
                  },
                  {
                    name: "CNK Establishment",
                    image: "/images/clients/cnk-establishment.jpeg",
                    imageClassName: "max-h-11",
                  },
                  {
                    name: "NEIP",
                    image: "/images/clients/neip.png",
                    imageClassName: "max-h-11",
                  },
                ].map((business, index) => (
                  <div
                    key={`${business.name}-${index}`}
                    className={[
                      "group flex h-[68px] min-w-[150px] items-center justify-center",
                      "rounded-xl border border-slate-200 bg-white/90 px-5",
                      "shadow-[0_6px_20px_rgba(15,23,42,.04)] transition duration-300",
                      "hover:-translate-y-0.5 hover:border-blue-200",
                      "hover:shadow-[0_10px_28px_rgba(37,99,235,.09)] sm:min-w-[175px]",
                    ].join(" ")}
                    title={business.name}
                  >
                    <Image
                      src={business.image}
                      alt={`${business.name} logo`}
                      width={170}
                      height={70}
                      sizes="170px"
                      className={`${business.imageClassName} h-auto w-auto max-w-full object-contain opacity-75 transition duration-300 group-hover:scale-105 group-hover:opacity-100`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="brand-section bg-white">
        <div className="container-shell grid gap-8 sm:gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <MotionReveal>
            <p className="brand-kicker">About Rennovex</p>
            <h2 className="brand-title mt-4 sm:!text-5xl lg:!text-6xl">
              Technology
              <br />
              With <span>Purpose</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              We are a digital solutions company passionate about helping businesses
              unlock their potential through technology, creativity, and strategy.
              From startups to established enterprises, we build solutions that make
              a real impact.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {[
                "Practical solutions",
                "Thoughtful design",
                "Reliable technology",
              ].map((principle) => (
                <span
                  key={principle}
                  className={`
                    rounded-full border border-blue-100 bg-blue-50/70
                    px-3.5 py-2 text-xs font-bold text-blue-700
                  `}
                >
                  {principle}
                </span>
              ))}
            </div>

            <Link href="/about" className="brand-btn-primary mt-7">
              Learn More About Us
              <ArrowRight size={17} />
            </Link>
          </MotionReveal>

          <MotionReveal
            className={`
              relative min-h-[360px] overflow-hidden rounded-2xl
              bg-slate-50 shadow-xl
              min-[430px]:min-h-[430px]
              sm:min-h-[520px] sm:rounded-3xl
              lg:min-h-[560px]
            `}
          >
            <Image
              src="/images/home/technology-with-purpose.jpg"
              alt="Professional at Rennovex Technology"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-contain object-center"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-950/45 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 px-5 py-4 shadow-lg backdrop-blur">
              <p className="text-sm font-bold text-[#071d49]">
                Innovate • Design • Transform
              </p>
            </div>
          </MotionReveal>
        </div>

        <div className="container-shell mt-10">
          <div
            className={[
              "grid overflow-hidden rounded-2xl border border-slate-200 bg-white",
              "shadow-lg min-[480px]:grid-cols-2 lg:grid-cols-4",
            ].join(" ")}
          >
            {[
              ["100+", "Projects Delivered", Rocket],
              ["50+", "Happy Clients", UsersRound],
              ["5+", "Years of Experience", BarChart3],
              ["99%", "Client Satisfaction", ShieldCheck],
            ].map(([value, label, Icon]: any) => (
              <div
                key={label}
                className={[
                  "flex items-center gap-3 border-b border-slate-100 p-4 last:border-0",
                  "min-[480px]:border-r sm:gap-4 sm:p-5 lg:border-b-0",
                ].join(" ")}
              >
                <Icon className="text-blue-600" size={28} />
                <div>
                  <p className="text-2xl font-extrabold text-[#071d49]">{value}</p>
                  <p className="text-xs font-semibold text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-section bg-[#041d49] text-white">
        <div className="container-shell">
          <div className="grid gap-6 lg:grid-cols-[1fr_.75fr] lg:items-end">
            <MotionReveal>
              <p className="brand-kicker !text-cyan-300">Our Services</p>
              <h2
                className={`
                  mt-4 text-3xl font-extrabold tracking-[-.04em]
                  min-[420px]:text-4xl sm:text-5xl
                `}
              >
                Solutions for
                <br />
                Every Stage of Your Growth
              </h2>
            </MotionReveal>
            <p className="max-w-xl text-sm leading-7 text-blue-100 lg:justify-self-end">
              We combine technical expertise and creative excellence to deliver
              tailored solutions that solve real business problems.
            </p>
          </div>

          <MotionStagger className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2 lg:grid-cols-3">
            {displayedServices.map(
              ({ title, summary, slug, icon: Icon, image, imageAlt }) => (
                <MotionItem key={title}>
                  <Link
                    href={`/services/${slug}`}
                    className={`
  group block h-full overflow-hidden rounded-[1.35rem] border
  border-white/10 bg-white text-slate-900
  shadow-[0_18px_50px_rgba(2,12,35,0.24)] transition duration-300
  hover:-translate-y-1.5 hover:shadow-[0_24px_65px_rgba(2,12,35,0.32)]
`}
                  >
                    <div className="relative h-48 overflow-hidden sm:h-52">
                      <Image
                        src={image}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#041d49]/65 via-transparent to-transparent" />
                      <span
                        className={`
  absolute bottom-4 left-5 grid h-12 w-12 place-items-center rounded-full
  border border-white/60 bg-white text-blue-600 shadow-xl
`}
                      >
                        <Icon size={21} />
                      </span>
                    </div>

                    <div className="p-5 sm:p-6">
                      <h3 className="text-xl font-bold tracking-[-0.02em] text-[#071d49]">
                        {title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {summary}
                      </p>
                      <span
                        className={[
                          "mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-600",
                          "transition group-hover:gap-3",
                        ].join(" ")}
                      >
                        Learn More
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                </MotionItem>
              ),
            )}
          </MotionStagger>

          <MotionReveal className="mt-8 flex justify-center sm:mt-10">
            <Link
              href="/services"
              className={[
                "brand-btn-secondary !border-white/25 !bg-white/10 !text-white",
                "hover:!bg-white hover:!text-blue-700",
              ].join(" ")}
            >
              Explore All Services
              <ArrowRight size={17} />
            </Link>
          </MotionReveal>
        </div>
      </section>

      <section className="brand-section relative overflow-hidden bg-white">
        <div
          className={[
            "pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full",
            "bg-blue-100/60 blur-3xl",
          ].join(" ")}
        />
        <div className="container-shell relative">
          <MotionReveal className="grid gap-5 lg:grid-cols-[1fr_.72fr] lg:items-end">
            <div>
              <p className="brand-kicker">Featured Projects</p>
              <h2 className="brand-title mt-3">
                Selected Work.
                <br />
                <span>Built With Purpose.</span>
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-md text-sm leading-7 text-slate-500">
                A closer look at digital products and experiences designed to solve
                real problems and create measurable value.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                <Link
                  href="/projects"
                  className={[
                    "inline-flex items-center gap-2 text-sm font-extrabold text-blue-600",
                    "transition hover:gap-3",
                  ].join(" ")}
                >
                  Explore all projects
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/case-studies"
                  className={[
                    "inline-flex items-center gap-2 text-sm font-extrabold text-slate-600",
                    "transition hover:text-blue-700",
                  ].join(" ")}
                >
                  Read case studies
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </MotionReveal>

          <MotionStagger className="mt-9 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(projects.length
              ? projects
              : [
                  {
                    id: "1",
                    title: "Car Dealership Website",
                    description:
                      "Modern car dealership platform with inventory management.",
                    image: null,
                    technologies: ["Next.js", "PostgreSQL", "Cloud"],
                  },
                  {
                    id: "2",
                    title: "Business Management App",
                    description:
                      "A mobile-first experience that helps businesses manage operations.",
                    image: null,
                    technologies: ["Web App", "Automation"],
                  },
                  {
                    id: "3",
                    title: "Brand Identity System",
                    description:
                      "Complete branding and visual identity for a growing business.",
                    image: null,
                    technologies: ["Branding", "Design"],
                  },
                ]
            )
              .slice(0, 3)
              .map((project: any) => (
                <MotionItem key={project.id} className="h-full">
                  <Link
                    href={
                      caseStudySlugs.has(project.slug)
                        ? `/case-studies/${project.slug}`
                        : "/projects"
                    }
                    className={`
  group flex h-full flex-col overflow-hidden rounded-[1.6rem] border
  border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,.08)]
  transition duration-300 hover:-translate-y-1.5 hover:border-blue-200
  hover:shadow-[0_24px_65px_rgba(15,23,42,.13)]
`}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#071d49]">
                      {project.image ? (
                        <>
                          <Image
                            src={project.image}
                            alt=""
                            fill
                            aria-hidden="true"
                            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
                            className="scale-110 object-cover opacity-25 blur-xl"
                          />
                          <div className="absolute inset-2.5 overflow-hidden rounded-[1rem] bg-slate-950/15 sm:inset-3">
                            <Image
                              src={project.image}
                              alt={project.title}
                              fill
                              sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
                              className="object-contain transition duration-500 group-hover:scale-[1.015]"
                            />
                          </div>
                        </>
                      ) : (
                        <div
                          className={`
  absolute inset-0
  bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,.55),transparent_35%),linear-gradient(135deg,#061b46,#0b4da2)]
`}
                        >
                          <div className="absolute inset-0 grid place-items-center">
                            <Code2 size={56} className="text-white/35" />
                          </div>
                        </div>
                      )}
                      <div
                        className={[
                          "pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b",
                          "from-slate-950/35 to-transparent",
                        ].join(" ")}
                      />
                      <div
                        className={`
  absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border
  border-white/20 bg-slate-950/35 px-3 py-1.5 text-[9px] font-extrabold
  uppercase tracking-[.16em] text-white backdrop-blur-md
`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                        Featured Project
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl font-extrabold tracking-[-.035em] text-[#071d49] sm:text-[1.35rem]">
                          {project.title}
                        </h3>
                        <span
                          className={`
  grid h-10 w-10 shrink-0 place-items-center rounded-full border
  border-blue-100 bg-blue-50 text-blue-700 transition duration-300
  group-hover:border-blue-600 group-hover:bg-blue-600
  group-hover:text-white
`}
                        >
                          <ArrowUpRight size={18} />
                        </span>
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {project.description}
                      </p>

                      <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        {(project.technologies || [])
                          .slice(0, 3)
                          .map((tech: string) => (
                            <span
                              key={tech}
                              className={[
                                "rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5",
                                "text-[10px] font-bold text-slate-600",
                              ].join(" ")}
                            >
                              {tech}
                            </span>
                          ))}
                      </div>

                      <span
                        className={`
                        mt-5 inline-flex items-center gap-2 border-t
                        border-slate-100 pt-4 text-sm font-extrabold
                        text-blue-700
                      `}
                      >
                        View Project Details
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                </MotionItem>
              ))}
          </MotionStagger>
        </div>
      </section>

      <section className="brand-section bg-[#f7faff]">
        <div className="container-shell">
          <MotionReveal>
            <p className="brand-kicker">Our Process</p>
            <h2 className="brand-title mt-3">
              A Simple Process
              <br />
              for
              <span>Great Results</span>
            </h2>
          </MotionReveal>
          <MotionStagger className="mt-8 grid gap-4 min-[520px]:grid-cols-2 sm:mt-10 lg:grid-cols-5">
            {process.map(([num, title, text, Icon]) => (
              <MotionItem key={num}>
                <div className="relative h-full rounded-2xl border border-blue-100 bg-white p-5 text-center shadow-sm">
                  <span className="absolute right-4 top-4 text-xs font-extrabold text-blue-400">
                    {num}
                  </span>
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-blue-50 text-blue-600">
                    <Icon size={23} />
                  </span>
                  <h3 className="mt-4 font-bold text-[#071d49]">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
                </div>
              </MotionItem>
            ))}
          </MotionStagger>
        </div>
      </section>

      <section className="brand-section bg-[#041d49] text-white">
        <div className="container-shell">
          <p className="brand-kicker !text-cyan-300">Client Testimonials</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">
            What Our Clients Say
          </h2>
          <div className="mt-7 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-2">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="rounded-2xl bg-white p-6 text-slate-800 shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-blue-50 ring-4 ring-blue-50">
                    {testimonial.imageUrl ? (
                      <Image
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-lg font-extrabold text-blue-700">
                        {testimonial.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-[#071d49]">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                    <p className="mt-1 text-amber-400">
                      {"★".repeat(testimonial.rating)}
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7">“{testimonial.quote}”</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className={[
          "relative overflow-hidden bg-gradient-to-r from-[#061b46]",
          "via-[#073b82] to-blue-600 py-10 text-white",
        ].join(" ")}
      >
        <div
          className={[
            "container-shell relative flex flex-col gap-5 sm:gap-6 lg:flex-row",
            "lg:items-center lg:justify-between",
          ].join(" ")}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[.22em] text-cyan-300">
              Let's Build Together
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-.03em] sm:text-3xl">
              Have an Idea? Let’s Build
              <span className="text-cyan-300">What’s Next.</span>
            </h2>
            <p className="mt-2 text-sm text-blue-100">
              Turn your next technology or creative idea into something people can
              experience.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className={`
                inline-flex shrink-0 items-center justify-center gap-2
                rounded-xl bg-white px-6 py-3 text-sm font-bold
                text-blue-700 shadow-lg transition hover:-translate-y-0.5
              `}
            >
              Start a Project
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/book-consultation"
              className={`
                inline-flex shrink-0 items-center justify-center gap-2
                rounded-xl border border-white/30 bg-white/10 px-6 py-3
                text-sm font-bold text-white transition hover:bg-white/20
              `}
            >
              Book a Consultation
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
