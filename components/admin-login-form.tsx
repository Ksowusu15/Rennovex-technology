"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, 
  useSearchParams } from "next/navigation";
import { SiteLogo } from "@/components/site-logo";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles
} from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");
  const notice = reason === "expired" 
    ? "Your session expired. Please sign in again." 
    : reason === "disabled" 
    ? "This administrator account is disabled." 
    : reason === "required" 
    ? "Please sign in to access the admin portal." 
    : reason === "signed-out" 
    ? "You have been signed out successfully." 
    : "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        rememberMe,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error 
        ?? "Unable to sign in. Please try again.");
      setLoading(false);
      return;
    }

    router.push(data.redirectTo 
      ?? "/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-[460px]">
      <div className="mb-6 text-center sm:mb-8">
        <SiteLogo 
          size="large" 
          centered />
        <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
          <ShieldCheck 
            className="text-blue-700" 
            size={17} />
          Admin Portal
        </div>
      </div>

      <Link
        href="/"
        className={`
  mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200
  bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm
  transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700
`}
      >
        <ArrowLeft size={16} />
        Back to website
      </Link>

      <form
        onSubmit={submit}
        className="w-full rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10 sm:p-8"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          <Sparkles size={14} /> 
          Administrator access
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Sign in 
        </h1>
        
        <label className="mt-7 grid gap-2 text-sm font-semibold text-slate-800">
          Admin email
          
          <span className="relative block">
            <Mail
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              className="admin-auth-field pl-11"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="admin@rennovex.com"
              required
            />
          </span>
        </label>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label 
              htmlFor="admin-password" 
              className="text-sm font-semibold text-slate-800">
              Password
            </label>
            <Link
              href="/admin/forgot-password"
              className="text-xs font-semibold text-blue-700 transition hover:text-blue-900 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <span className="relative block">
            <LockKeyhole
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={18}
            />
            <input
              id="admin-password"
              className="admin-auth-field px-11"
              name="password"
              type={showPassword 
                ? "text" 
                : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword 
                ? "Hide password" 
                : "Show password"}
              className={`
  absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5
  text-slate-500 transition hover:bg-slate-100 hover:text-slate-900
`}
            >
              {showPassword 
                ? <EyeOff size={18} /> 
                : <Eye size={18} />}
            </button>
          </span>
        </div>

        <label className={`
  mt-5 flex cursor-pointer items-start gap-3 rounded-xl border
  border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-blue-200
  hover:bg-blue-50/60
`}>
          <input
            type="checkbox"
            name="rememberMe"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-700 accent-blue-700 focus:ring-2 focus:ring-blue-200"
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-800">Keep me logged in</span>
            <span className="mt-0.5 block text-xs leading-5 text-slate-500">
              Stay signed in on this trusted device for up to 7 days. Unchecked sessions last up to 2 hours.
            </span>
          </span>
        </label>

        {notice 
          && !error && (
          <p className={`mt-5 rounded-xl border px-4 py-3 text-sm font-medium ${reason === "signed-out" 
            ? "border-emerald-200 bg-emerald-50 text-emerald-800" 
            : "border-blue-200 bg-blue-50 text-blue-800"}`}>
            {notice}
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className={`
  mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2
  rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white
  shadow-lg shadow-blue-700/20 transition hover:bg-blue-800
  focus:outline-none focus:ring-4 focus:ring-blue-100
  disabled:cursor-not-allowed disabled:opacity-60
`}
        >
          {loading 
            ? "Signing in securely..." 
            : "Access admin dashboard"}
          {!loading 
            && <ArrowRight size={17} />}
        </button>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-500">
          This area is restricted to authorised Rennovex administrators.
        </div>
      </form>
    </div>
  );
}
