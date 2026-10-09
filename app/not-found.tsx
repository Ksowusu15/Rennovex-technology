import Link from "next/link";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="container-shell py-20 text-center">
      <p className="eyebrow">Page not found</p>
      <h1 className="mt-4 text-3xl font-bold">Let’s get you back on track.</h1>
      <p className="mt-4 text-slate-600">
        This page may have moved or no longer exists.
      </p>
      <Link href="/" className="btn-primary mt-7">
        Return to website
      </Link>
    </main>
  );
}
