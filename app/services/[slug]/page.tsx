import { WhatsAppLink } from "@/components/whatsapp-link";
import Link from "next/link";
import { MotionReveal } from "@/components/motion-reveal";
import { PricingPlanCards } from "@/components/pricing-plan-cards";
import { ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { allPricing } from "@/lib/pricing-data";
import { getServiceDetail, serviceDetails } from "@/lib/service-details";

export function generateStaticParams() {
  return serviceDetails.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceDetail(slug);
  if (!service) notFound();
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/services/${encodeURIComponent(slug)}` },
  };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const service = getServiceDetail(slug);

  if (!service) {
    notFound();
  }

  const pricing = service.pricingSlug
    ? allPricing.find((item) => item.slug === service.pricingSlug)
    : undefined;

  return (
    <main>
      <section
        className={`
          relative overflow-hidden border-b border-slate-200
          bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950
          py-16 text-white sm:py-20 lg:py-24
        `}
      >
        <div
          className={`
            pointer-events-none absolute -right-24 -top-24 h-96 w-96
            rounded-full bg-blue-500/20 blur-3xl
          `}
        />

        <MotionReveal className="container-shell relative">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">
              {service.eyebrow}
            </p>

            <h1
              className={`
                mt-5 text-4xl font-bold tracking-[-0.04em]
                sm:text-5xl lg:text-6xl
              `}
            >
              {service.title}
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              {service.summary}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/contact?service=${encodeURIComponent(service.title)}`}
                className="enterprise-btn-primary justify-center"
              >
                Request a Quote
                <ArrowRight size={17} />
              </Link>

              <Link
                href="/book-consultation"
                className={`
                  inline-flex items-center justify-center gap-2 rounded-xl
                  border border-white/20 bg-white/10 px-5 py-3
                  text-sm font-bold text-white transition
                  hover:bg-white/15
                `}
              >
                Book Consultation
              </Link>
              <WhatsAppLink
                message={`Hello Rennovex Technology, I am interested in ${service.title}.`}
              />
            </div>
          </div>
        </MotionReveal>
      </section>

      <section className="section-space">
        <MotionReveal className="container-shell">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="eyebrow">Overview</p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950">
                Built around the outcome your business needs.
              </h2>
            </div>

            <p className="text-lg leading-8 text-slate-600">{service.description}</p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <h3 className="text-xl font-bold text-slate-950">What we deliver</h3>

              <div className="mt-6 grid gap-4">
                {service.deliverables.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-blue-700"
                      size={19}
                    />

                    <span className="leading-7 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-slate-950">
                Who this service is for
              </h3>

              <div className="mt-6 grid gap-4">
                {service.audience.map((item) => (
                  <div key={item} className="flex gap-3">
                    <ChevronRight
                      className="mt-1 shrink-0 text-blue-700"
                      size={18}
                    />

                    <span className="leading-7 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MotionReveal>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <MotionReveal className="container-shell">
          <p className="eyebrow">Our Process</p>

          <h2 className="mt-4 max-w-3xl text-3xl font-bold tracking-[-0.03em] text-slate-950">
            A clear process from discovery to delivery.
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {service.process.map((step, index) => (
              <article
                key={step.title}
                className={`
                  rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
                  transition duration-300 hover:-translate-y-1 hover:shadow-lg
                  motion-reduce:transform-none motion-reduce:transition-none
                `}
              >
                <span className="text-sm font-bold text-blue-700">0{index + 1}</span>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
        </MotionReveal>
      </section>

      <section className="section-space">
        <MotionReveal className="container-shell">
          <div className="grid gap-8 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="eyebrow">Business Value</p>

              <h2 className="mt-4 text-2xl font-bold text-slate-950">
                What this helps you achieve
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {service.benefits.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-blue-700"
                      size={18}
                    />

                    <span className="text-sm leading-6 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-300">
                Technology & Methods
              </p>

              <h2 className="mt-4 text-2xl font-bold">
                The right tools for the solution.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Technology is selected around maintainability, performance and the
                requirements of the project rather than treated as a separate
                service.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {service.technologies.map((item) => (
                  <span
                    key={item}
                    className={`
                        rounded-full border border-white/15 bg-white/10
                        px-4 py-2 text-sm text-slate-100
                      `}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </MotionReveal>
      </section>

      {pricing && (
        <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
          <MotionReveal className="container-shell">
            <div className="max-w-3xl">
              <p className="eyebrow">Pricing</p>

              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950">
                Clear packages with room for the right scope.
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Choose a starting package or contact Rennovex for a tailored
                quotation when your requirements are more specialised.
              </p>
            </div>

            <div className="mt-10">
              <PricingPlanCards group={pricing} />
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="enterprise-btn-secondary justify-center"
              >
                View Full Pricing
              </Link>

              <Link
                href="/contact"
                className="enterprise-btn-primary justify-center"
              >
                Request a Custom Quote
              </Link>
            </div>
          </MotionReveal>
        </section>
      )}

      {!pricing && (
        <section className="border-y border-slate-200 bg-slate-50 py-14">
          <MotionReveal className="container-shell">
            <div
              className={`
                flex flex-col gap-6 rounded-3xl border border-slate-200
                bg-white p-7 shadow-sm md:flex-row md:items-center
                md:justify-between
              `}
            >
              <div>
                <p className="eyebrow">Project Pricing</p>

                <h2 className="mt-3 text-2xl font-bold text-slate-950">
                  Get a quotation based on your exact scope.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  We will review the requirements, deliverables and complexity before
                  recommending the right engagement.
                </p>
              </div>

              <Link
                href="/contact"
                className="enterprise-btn-primary shrink-0 justify-center"
              >
                Request a Quote
              </Link>
            </div>
          </MotionReveal>
        </section>
      )}

      <section className="py-16 sm:py-20">
        <MotionReveal className="container-shell">
          <div
            className={`
              rounded-3xl bg-blue-700 px-6 py-10 text-white
              sm:px-10 lg:flex lg:items-center lg:justify-between
            `}
          >
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-blue-100">
                Start a Project
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em]">
                Have a project in mind?
              </h2>

              <p className="mt-3 leading-7 text-blue-100">
                Tell us what you want to achieve. Rennovex will help define the right
                scope and next step.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-0">
              <Link
                href="/contact"
                className={`
                  inline-flex items-center justify-center gap-2 rounded-xl
                  bg-white px-5 py-3 text-sm font-bold text-blue-700
                  transition hover:bg-blue-50
                `}
              >
                Request a Quote
              </Link>

              <Link
                href="/services"
                className={`
                  inline-flex items-center justify-center gap-2 rounded-xl
                  border border-white/25 px-5 py-3 text-sm font-bold
                  text-white transition hover:bg-white/10
                `}
              >
                Explore Services
              </Link>
            </div>
          </div>
        </MotionReveal>
      </section>
    </main>
  );
}
