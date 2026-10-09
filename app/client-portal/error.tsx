"use client";

import Link from "next/link";

export default function ClientPortalError({ reset }: { reset: () => void }) {
  return (
    <section className="portal-shell py-12">
      <div className="portal-panel mx-auto max-w-xl text-center">
        <p className="eyebrow">Client workspace</p>
        <h1 className="mt-3 text-2xl font-bold">
          We could not load your workspace.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Please try again. Your saved projects and account details are unchanged.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Return to website
          </Link>
        </div>
      </div>
    </section>
  );
}
