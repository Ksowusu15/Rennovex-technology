"use client";

import { formRequest } from "@/lib/form-request";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

export function ClientLoginForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    try {
      const response = await formRequest("/api/client-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to sign in.");
        setLoading(false);
        return;
      }

      window.location.href = "/client-portal/dashboard";
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to complete your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      aria-busy={loading}
      className={`
        rounded-[2rem] border border-slate-200
        bg-white p-6 shadow-xl shadow-slate-200/60
        sm:p-8
      `}
    >
      <div className="mb-6">
        <p
          className={`
            text-sm font-semibold uppercase
            tracking-[0.18em] text-blue-600
          `}
        >
          Welcome to your workspace
        </p>
        <h2
          className={`
            mt-2 text-2xl font-bold text-slate-950
          `}
        >
          Sign in to continue
        </h2>
      </div>

      <p className="mb-7 text-sm leading-6 text-slate-500">
        Use the email address associated with your Rennovex client account.
      </p>
      <div className="space-y-4">
        <label className="block">
          <span
            className={`
              mb-2 block text-sm font-semibold
              text-slate-700
            `}
          >
            Email address
          </span>
          <input
            className="field"
            name="email"
            disabled={loading}
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="client@example.com"
            required
          />
        </label>

        <label className="block">
          <span
            className={`
              mb-2 block text-sm font-semibold
              text-slate-700
            `}
          >
            Password
          </span>
          <span className="relative block">
            <input
              className="field pr-12"
              name="password"
              disabled={loading}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => {
                setShowPassword((current) => !current);
              }}
              className={`
                absolute right-3 top-1/2
                grid h-9 w-9 -translate-y-1/2
                place-items-center rounded-lg
                text-slate-500 transition
                hover:bg-slate-100 hover:text-blue-700
                focus:outline-none focus:ring-2
                focus:ring-blue-200
              `}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
      </div>

      <div className="mt-3 flex justify-end">
        <Link
          href="/client-portal/forgot-password"
          className={`
            text-sm font-semibold text-blue-700
            transition hover:text-blue-900
          `}
        >
          Forgot password?
        </Link>
      </div>

      {error && (
        <p
          role="alert"
          className={`
            mt-4 rounded-xl bg-red-50 p-3
            text-sm text-red-700
          `}
        >
          {error}
        </p>
      )}

      <button className="btn-primary mt-6 w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <ArrowRight size={18} />
        )}
        {loading ? "Signing in…" : "Sign in"}
      </button>

      <p
        className={`
          mt-5 text-center text-xs leading-5
          text-slate-500
        `}
      >
        Client accounts are invitation-only. Contact Rennovex if you need
        access.
      </p>
    </form>
  );
}
