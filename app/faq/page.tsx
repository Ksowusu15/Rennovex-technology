import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

export const metadata = {
  alternates: { canonical: "/faq" },
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about Rennovex Technology services, pricing, projects and support.",
};

const faqs = [
  {
    question: "What services does Rennovex Technology provide?",
    answer:
      "Rennovex provides website development, e-commerce development, custom software development, UI/UX design, graphic design and branding, and IT solutions and consulting.",
  },
  {
    question: "How much does a project cost?",
    answer:
      "Pricing depends on the service, scope and complexity. Selected services have starting packages on the pricing pages, while specialised projects are quoted after the requirements have been reviewed.",
  },
  {
    question: "How do I start a project with Rennovex?",
    answer:
      "You can request a quote or book a consultation. We will discuss your goals, requirements and expected outcome before recommending the appropriate scope and next step.",
  },
  {
    question: "How long does a project take?",
    answer:
      "Timelines vary by project size, requirements, feedback cycles and integrations. A clearer delivery schedule is provided after the scope has been defined.",
  },
  {
    question: "Can Rennovex redesign an existing website or system?",
    answer:
      "Yes. We can review an existing website or digital system and recommend whether it should be improved, redesigned or rebuilt based on its current condition and your objectives.",
  },
  {
    question: "Does Rennovex build e-commerce websites?",
    answer:
      "Yes. E-commerce development can include product and category management, shopping cart and checkout, payment integration, customer accounts, inventory tools, discounts and order management depending on the selected scope.",
  },
  {
    question: "Can I request features that are not included in a package?",
    answer:
      "Yes. Packages provide a useful starting point. Additional functionality and specialised requirements can be included through a custom quotation.",
  },
  {
    question: "Will I receive support after my project is launched?",
    answer:
      "Post-launch support depends on the selected service or project agreement. Ongoing maintenance and technical support can also be discussed where required.",
  },
  {
    question: "How can existing clients access their project information?",
    answer:
      "Approved clients can use the Rennovex Client Portal to access the project information made available to them, including relevant progress, updates, files, invoices and support information.",
  },
];

export default function FAQPage() {
  return (
    <main>
      <section
        className={`
          border-b border-slate-200 bg-gradient-to-b
          from-blue-50/70 to-white py-16 sm:py-20
        `}
      >
        <div className="container-shell">
          <p className="eyebrow">Resources</p>

          <h1
            className={`
              mt-5 max-w-4xl text-4xl font-bold
              tracking-[-0.04em] text-slate-950
              sm:text-5xl
            `}
          >
            Frequently Asked Questions
          </h1>

          <p
            className={`
              mt-6 max-w-3xl text-lg
              leading-8 text-slate-600
            `}
          >
            Helpful answers about our services, pricing, project process and client
            support.
          </p>
        </div>
      </section>

      <section className="section-space">
        <div
          className={`
            container-shell grid gap-10
            lg:grid-cols-[0.72fr_1.28fr]
          `}
        >
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">Need more help?</p>

            <h2
              className={`
                mt-4 text-2xl font-bold
                tracking-[-0.03em] text-slate-950
              `}
            >
              Tell us about your project.
            </h2>

            <p
              className={`
                mt-3 max-w-md text-sm
                leading-7 text-slate-600
              `}
            >
              If your question is specific to your organisation or project, contact
              Rennovex and we will help you determine the next step.
            </p>

            <Link href="/contact" className="enterprise-btn-primary mt-6">
              Contact Rennovex
              <ArrowRight size={17} />
            </Link>
          </aside>

          <div className="grid gap-3">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className={`
                    group rounded-2xl border
                    border-slate-200 bg-white
                    shadow-sm transition
                    open:border-blue-200
                    open:shadow-md
                  `}
              >
                <summary
                  className={`
                      flex cursor-pointer list-none
                      items-center justify-between gap-5
                      px-5 py-5 sm:px-6
                    `}
                >
                  <span className="flex gap-4">
                    <span
                      className={`
                          mt-0.5 text-xs font-bold
                          text-blue-700
                        `}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span
                      className={`
                          text-sm font-bold
                          leading-6 text-slate-950
                          sm:text-base
                        `}
                    >
                      {faq.question}
                    </span>
                  </span>

                  <ChevronDown
                    size={18}
                    className={`
                        shrink-0 text-slate-400
                        transition-transform duration-200
                        group-open:rotate-180
                        group-open:text-blue-700
                      `}
                  />
                </summary>

                <div
                  className={`
                      border-t border-slate-100
                      px-5 py-5 sm:px-6
                    `}
                >
                  <p
                    className={`
                        pl-0 text-sm leading-7
                        text-slate-600 sm:pl-10
                      `}
                  >
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
