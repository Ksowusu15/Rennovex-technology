"use client";

import { formRequest } from "@/lib/form-request";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, Loader2, Send } from "lucide-react";

export function ClientForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);
    try {
      const response = await formRequest("/api/client-auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.get("email"),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Unable to process your request.");
        setLoading(false);
        return;
      }

      setMessage(data.message);
      setLoading(false);
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
      <p className="eyebrow">Client account recovery</p>
      <h1
        className={`
          mt-3 text-3xl font-bold tracking-tight
          text-slate-950
        `}
      >
        Forgot your password?
      </h1>
      <p
        className={`
          mt-3 text-sm leading-6 text-slate-600
        `}
      >
        Enter your client email address. If an active account exists, we will send a
        secure reset link that expires in 10 minutes.
      </p>

      <label className="mt-7 block">
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

      {message && (
        <p
          role="status"
          className={`
            mt-5 rounded-xl border border-emerald-200
            bg-emerald-50 px-4 py-3 text-sm
            text-emerald-800
          `}
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className={`
            mt-5 rounded-xl border border-red-200
            bg-red-50 px-4 py-3 text-sm
            text-red-700
          `}
        >
          {error}
        </p>
      )}

      <button disabled={loading} className="btn-primary mt-6 w-full">
        {loading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <Send size={18} />
        )}
        {loading ? "Sending reset link…" : "Send reset link"}
      </button>

      <Link
        href="/client-portal"
        className={`
          mt-5 flex items-center justify-center gap-2
          text-sm font-semibold text-slate-600
          transition hover:text-blue-700
        `}
      >
        <ArrowLeft size={16} />
        Back to client login
      </Link>
    </form>
  );
}
