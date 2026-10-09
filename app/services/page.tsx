import Link from "next/link";
import {
  MotionItem,
  MotionReveal,
  MotionStagger,
} from "@/components/motion-reveal";
import {
  ArrowUpRight,
  Code2,
  Globe2,
  Palette,
  PanelsTopLeft,
  ServerCog,
  ShoppingBag,
} from "lucide-react";
import { serviceDetails } from "@/lib/service-details";

export const metadata = {
  alternates: { canonical: "/services" },
  title: "Services",
};

const icons = {
  "website-development": Globe2,
  "e-commerce-development": ShoppingBag,
  "custom-software-development": Code2,
  "ui-ux-design": PanelsTopLeft,
  "graphic-design": Palette,
  "it-consulting": ServerCog,
} as const;

export default function ServicesPage() {
  return (
    <main>
      <section
        className={`
          border-b border-slate-200 bg-gradient-to-b
          from-blue-50/70 to-white py-16 sm:py-20
        `}
      >
        <MotionReveal className="container-shell">
          <p className="eyebrow">Services</p>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl">
            Digital services designed around real business outcomes.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            From your public website to internal software and technology strategy,
            Rennovex combines design and engineering to build practical solutions for
            growing organisations.
          </p>
        </MotionReveal>
      </section>

      <section className="section-space">
        <div className="container-shell">
          <MotionStagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {serviceDetails.map((service, index) => {
              const Icon = icons[service.slug as keyof typeof icons];

              return (
                <MotionItem key={service.slug} className="h-full">
                  <Link
                    href={`/services/${service.slug}`}
                    className={`
                        group block h-full rounded-3xl border border-slate-200 bg-white
                        p-6 shadow-sm transition duration-300
                        hover:-translate-y-1 hover:border-blue-200
                        hover:shadow-lg
                      `}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`
                            grid h-12 w-12 place-items-center rounded-2xl
                            bg-blue-50 text-blue-700 transition
                            group-hover:bg-blue-700 group-hover:text-white
                          `}
                      >
                        <Icon size={22} />
                      </span>

                      <span className="text-sm font-bold text-slate-300">
                        0{index + 1}
                      </span>
                    </div>

                    <h2 className="mt-7 text-xl font-bold text-slate-950">
                      {service.title}
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {service.summary}
                    </p>

                    <span
                      className={`
                          mt-6 inline-flex items-center gap-2 text-sm
                          font-bold text-blue-700
                        `}
                    >
                      Explore service
                      <ArrowUpRight
                        size={17}
                        className={`
                            transition group-hover:-translate-y-0.5
                            group-hover:translate-x-0.5
                          `}
                      />
                    </span>
                  </Link>
                </MotionItem>
              );
            })}
          </MotionStagger>
        </div>
      </section>
    </main>
  );
}
