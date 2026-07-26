import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Rennovex Technology",
  description: "How Rennovex Technology handles website and enquiry information.",
};

export default function PrivacyPage() {
  return (
    <main className="container-shell py-16 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Legal</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Privacy Policy</h1>
        <div className="mt-8 space-y-6 text-base leading-8 text-slate-600">
          <p>Rennovex Technology collects information you voluntarily provide through contact, quotation, consultation, newsletter, and assistant forms.</p>
          <p>We use this information to respond to enquiries, provide requested services, improve our website, and maintain appropriate business records.</p>
          <p>We do not sell personal information. Access is limited to authorised personnel and service providers needed to operate the website.</p>
          <p>To request access, correction, or deletion of your information, contact Rennovex Technology through the website contact page.</p>
        </div>
      </div>
    </main>
  );
}
