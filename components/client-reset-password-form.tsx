"use client";

import { formRequest } from "@/lib/form-request";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

export function ClientResetPasswordForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await formRequest("/api/client-auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to reset your password.");
        setLoading(false);
        return;
      }

      setComplete(true);
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

  if (complete) {
    return (
      <div
        className={`
          rounded-[2rem] border border-slate-200
          bg-white p-8 text-center shadow-xl
          shadow-slate-200/60
        `}
      >
        <CheckCircle2 className="mx-auto text-emerald-600" size={42} />
        <h1
          className={`
            mt-4 text-2xl font-bold text-slate-950
          `}
        >
          Password updated
        </h1>
        <p
          className={`
            mt-3 text-sm leading-6 text-slate-600
          `}
        >
          Your client password has been changed. You can now sign in with your new
          password.
        </p>
        <Link href="/client-portal" className="btn-primary mt-6 w-full">
          Return to client login
        </Link>
      </div>
    );
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
      <p className="eyebrow">Secure password reset</p>
      <h1
        className={`
          mt-3 text-3xl font-bold tracking-tight
          text-slate-950
        `}
      >
        Create a new password
      </h1>
      <p
        className={`
          mt-3 text-sm leading-6 text-slate-600
        `}
      >
        Use at least 8 characters with an uppercase letter, lowercase letter and
        number.
      </p>

      <div className="mt-7 space-y-4">
        <PasswordField
          name="password"
          label="New password"
          show={showPassword}
          onToggle={() => {
            setShowPassword((current) => !current);
          }}
        />
        <PasswordField
          name="confirmPassword"
          label="Confirm new password"
          show={showConfirm}
          onToggle={() => {
            setShowConfirm((current) => !current);
          }}
        />
      </div>

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
        {loading && <Loader2 className="animate-spin" size={18} />}
        {loading ? "Updating password…" : "Update password"}
      </button>
    </form>
  );
}

function PasswordField({
  name,
  label,
  show,
  onToggle,
}: {
  name: string;
  label: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block">
      <span
        className={`
          mb-2 block text-sm font-semibold
          text-slate-700
        `}
      >
        {label}
      </span>
      <span className="relative block">
        <input
          className="field pr-12"
          name={name}
          type={show ? "text" : "password"}
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className={`
            absolute right-3 top-1/2 grid h-9 w-9
            -translate-y-1/2 place-items-center
            rounded-lg text-slate-500 transition
            hover:bg-slate-100 hover:text-blue-700
          `}
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
