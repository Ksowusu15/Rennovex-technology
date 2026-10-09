import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientProfileForm } from "@/components/client-profile-form";
import { getClientSession } from "@/lib/client-auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Profile | Rennovex Client Portal",
};

export default async function ClientProfilePage() {
  const session = await getClientSession();

  if (!session) {
    redirect("/client-portal");
  }

  const client = await prisma.client.findUnique({
    where: {
      id: session.id,
    },
  });

  if (!client || !client.isActive) {
    redirect("/client-portal");
  }

  return (
    <main className="portal-shell py-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/client-portal/dashboard"
          className="text-sm font-semibold text-blue-600"
        >
          ← Back to dashboard
        </Link>
        <div className="surface mt-5 p-5 sm:p-7">
          <p className="text-sm font-semibold text-blue-600">Account & security</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Client profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            {client.name} · {client.email}
          </p>
          <div className="mt-7">
            <ClientProfileForm
              company={client.company ?? ""}
              phone={client.phone ?? ""}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
