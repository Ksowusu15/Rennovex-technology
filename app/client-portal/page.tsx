import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { ClientLoginForm } from "@/components/client-login-form";
import { getClientSession } from "@/lib/client-auth";

export const metadata = {
  title: "Client Portal | Rennovex Technology",
};

export default async function ClientPortalPage() {
  const session = await getClientSession();
  if (session) redirect("/client-portal/dashboard");

  return (
    <section className="min-h-[calc(100vh-5rem)] bg-slate-50 py-14 sm:py-20">
      <div className="container-shell mb-8 sm:mb-10">
        <Link
          href="/"
          className={[
            "inline-flex min-h-11 items-center gap-2 rounded-xl",
            "border border-slate-200 bg-white px-4 py-3",
            "text-sm font-semibold text-blue-700 transition-colors",
            "hover:border-blue-200 hover:bg-blue-50",
            "focus-visible:outline focus-visible:outline-2",
            "focus-visible:outline-offset-4 focus-visible:outline-blue-600",
          ].join(" ")}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Return to website
        </Link>
      </div>
      <div className="container-shell grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div>
          <p className="eyebrow">Rennovex client portal</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Your projects, updates and support in one secure workspace.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Follow project progress, review milestones, access deliverables, track
            invoices and contact Rennovex support from one place.
          </p>
        </div>

        <ClientLoginForm />
      </div>
    </section>
  );
}
