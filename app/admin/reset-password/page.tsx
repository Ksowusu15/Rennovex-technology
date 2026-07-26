import Link from "next/link";
import { createHash } from "crypto";
import { AlertTriangle, ArrowLeft, Clock3 } from "lucide-react";
import { AdminResetPasswordForm } from "@/components/admin-reset-password-form";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Reset Password | Rennovex Admin" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  let valid = false;
  let databaseUnavailable = false;

  if (/^[a-f0-9]{64}$/i.test(token)) {
    try {
      const tokenHash = createHash("sha256").update(token).digest("hex");
      const user = await prisma.user.findFirst({
        where: {
          resetTokenHash: tokenHash,
          resetTokenExpires: { gt: new Date() },
          isActive: true,
        },
        select: { id: true },
      });
      valid = Boolean(user);
    } catch (error) {
      databaseUnavailable = true;
      console.error("Unable to validate password-reset token:", error);
    }
  }

  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative w-full">
        {valid ? (
          <AdminResetPasswordForm token={token} />
        ) : (
          <div className="mx-auto w-full max-w-[460px] rounded-[1.75rem] border border-amber-200 bg-white p-6 text-center shadow-2xl shadow-slate-950/10 sm:p-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-100 text-amber-700">
              <AlertTriangle size={28} />
            </div>
            <p className="eyebrow mt-5">Reset link unavailable</p>
            <h1 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">
              {databaseUnavailable ? "The reset service is temporarily unavailable" : "This link is invalid or expired"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {databaseUnavailable
                ? "The website could not verify your reset link. Check the database connection and try opening the email link again."
                : "Password-reset links can be used once and expire after 10 minutes. Request a new link and open the latest email you receive."}
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <Clock3 size={17} className="text-blue-700" />
              Valid for 10 minutes
            </div>
            <Link href={databaseUnavailable ? "/admin/reset-password?token=" + encodeURIComponent(token) : "/admin/forgot-password"} className="btn-primary mt-6 w-full">
              {databaseUnavailable ? "Try validating again" : "Request a new reset link"}
            </Link>
            <Link href="/admin/login" className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
              <ArrowLeft size={16} /> Back to admin login
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
