import { AdminLoginForm } from "@/components/admin-login-form";
import { ScrollControls } from "@/components/scroll-controls";

export const metadata = {
  title: "Admin Portal | Rennovex Technology",
  description: "Secure administrator access for Rennovex Technology.",
};

export default function AdminLoginPage() {
  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(79,70,229,0.12),transparent_34%)]" />
      <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative w-full">
        <AdminLoginForm />
      </div>
      <ScrollControls alwaysVisible />
    </section>
  );
}
