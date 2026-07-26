import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Rennovex Technology",
  description: "General website and service terms for Rennovex Technology.",
};

export default function TermsPage() {
  return (
    <main className="container-shell py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Terms of Service</h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-slate-600">
          <p>Website information is provided for general business and informational purposes. A formal proposal or signed agreement governs any paid engagement.</p>
          <p>Project scope, pricing, timelines, ownership, support, and payment terms are confirmed separately for each client engagement.</p>
          <p>You may not misuse the website, attempt unauthorised access, submit harmful content, or interfere with its operation.</p>
          <p>Rennovex Technology may update these terms as services and legal requirements change.</p>
        </div>
      </div>
    </main>
  );
}
