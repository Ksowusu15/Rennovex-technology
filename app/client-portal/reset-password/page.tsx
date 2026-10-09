import Link from "next/link";
import { ClientResetPasswordForm } from "@/components/client-reset-password-form";

export const metadata = {
  title: "Reset Password | Rennovex Client Portal",
};

export default async function ClientResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <section
      className={`
        min-h-[calc(100vh-5rem)] bg-slate-50
        px-4 py-14 sm:py-20
      `}
    >
      <div className="mx-auto w-full max-w-[480px]">
        {token ? (
          <ClientResetPasswordForm token={token} />
        ) : (
          <div
            className={`
              rounded-[2rem] border border-slate-200
              bg-white p-8 text-center shadow-xl
              shadow-slate-200/60
            `}
          >
            <h1 className="text-2xl font-bold text-slate-950">
              Reset link required
            </h1>
            <p
              className={`
                mt-3 text-sm leading-6 text-slate-600
              `}
            >
              Request a new password reset link from
              the client portal.
            </p>
            <Link
              href="/client-portal/forgot-password"
              className="btn-primary mt-6 w-full"
            >
              Request reset link
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
