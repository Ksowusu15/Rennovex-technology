import { ClientForgotPasswordForm } from "@/components/client-forgot-password-form";

export const metadata = {
  title: "Forgot Password | Rennovex Client Portal",
};

export default function ClientForgotPasswordPage() {
  return (
    <section
      className={`
        min-h-[calc(100vh-5rem)] bg-slate-50
        px-4 py-14 sm:py-20
      `}
    >
      <div className="mx-auto w-full max-w-[480px]">
        <ClientForgotPasswordForm />
      </div>
    </section>
  );
}
