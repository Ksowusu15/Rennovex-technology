import Link from "next/link";
import { ClientInviteForm } from "@/components/client-invite-form";

export const metadata = {
  title: "Activate Client Portal | Rennovex Technology",
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <p className="text-sm font-semibold text-blue-600">
          Rennovex Client Portal
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">
          Activate your account
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Create your private password to access project progress,
          deliverables, invoices and support.
        </p>

        <div className="mt-6">
          {token
            ? (
              <ClientInviteForm token={token} />
            )
            : (
              <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                This invitation link is incomplete. Ask Rennovex to resend your invitation.
              </p>
            )}
        </div>

        <Link
          href="/client-portal"
          className="mt-6 block text-center text-sm font-semibold text-blue-600"
        >
          Back to client login
        </Link>
      </div>
    </main>
  );
}
