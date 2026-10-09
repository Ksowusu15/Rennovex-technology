import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ClientSupportForm } from "@/components/client-support-form";
import { getClientSession } from "@/lib/client-auth";

export default async function ClientSupportPage() {
  const session = await getClientSession();
  if (!session) redirect("/client-portal");

  return (
    <main className="portal-shell py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/client-portal/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
        <h1 className="mt-6 text-3xl font-bold text-slate-950">Client support</h1>
        <p className="mt-3 text-slate-600">
          Tell us what you need help with and the Rennovex team will follow up.
        </p>
        <div className="mt-8">
          <ClientSupportForm />
        </div>
      </div>
    </main>
  );
}
