import { ArrowRight, CheckCircle2, MessagesSquare } from "lucide-react";
import { ConsultationBookingForm } from "@/components/consultation-booking-form";
import { WhatsAppLink } from "@/components/whatsapp-link";

export const metadata = {
  alternates: { canonical: "/book-consultation" },
  title: "Book a Consultation",
  description:
    "Tell Rennovex what you need and request a convenient time to discuss your project.",
};

const nextSteps = [
  "Send your details and preferred time.",
  "We review your request and contact you to confirm.",
  "We discuss your goals and the next steps for your project.",
];

export default function BookConsultationPage() {
  return (
    <main className="bg-slate-50/80">
      <section className="py-10 sm:py-14 lg:py-20">
        <div
          className={`
            container-shell grid items-start gap-8
            lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 xl:gap-20
          `}
        >
          <div className="lg:sticky lg:top-28">
            <p className="eyebrow">Let’s talk</p>
            <h1
              className={`
                mt-4 max-w-lg text-4xl font-bold tracking-[-0.04em]
                text-slate-950 sm:text-5xl
              `}
            >
              A clearer next step for your project.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
              Tell us what you have in mind and choose a time that works for you.
              We’ll get in touch to confirm the consultation.
            </p>

            <div className="mt-7 hidden lg:block">
              <h2 className="text-sm font-bold text-slate-950">
                What happens next
              </h2>
              <ol className="mt-4 space-y-5">
                {nextSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span
                      className={`
                        grid h-7 w-7 shrink-0 place-items-center rounded-full
                        bg-blue-100 text-xs font-bold text-blue-800
                      `}
                    >
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-6 text-slate-600">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-8 hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block">
              <MessagesSquare size={22} className="text-green-800" />
              <h2 className="mt-3 font-bold text-slate-950">
                Prefer to chat first?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Ask a question or tell us about your idea on WhatsApp.
              </p>
              <WhatsAppLink compact className="mt-4 min-h-11" />
            </div>
          </div>

          <div className="min-w-0">
            <ConsultationBookingForm />
            <div className="mt-6 flex items-start gap-2 px-1 text-sm leading-6 text-slate-600">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0 text-blue-700"
              />
              Your preferred time is confirmed only after our team contacts you.
            </div>
            <div className="mt-6 border-t border-slate-200 pt-6 lg:hidden">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Prefer to chat instead?
              </p>
              <WhatsAppLink />
            </div>
            <a
              href="/services"
              className={`
                mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold
                text-blue-700
              `}
            >
              Explore our services
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
