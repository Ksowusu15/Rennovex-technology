"use client";

import { formRequest } from "@/lib/form-request";

import { Eye, EyeOff } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function ClientInviteForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError("");

    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await formRequest("/api/client-auth/accept-invite", {
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
        setError(data.error ?? "Unable to activate account.");
        setLoading(false);
        return;
      }

      router.push("/client-portal?activated=1");
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
    <form onSubmit={submit} aria-busy={loading} className="space-y-4">
      <p className="text-sm leading-6 text-slate-600">
        Use at least 8 characters with uppercase, lowercase and a number.
      </p>
      <PasswordField
        label="Create password"
        value={password}
        onChange={setPassword}
        show={show}
        onToggle={() => setShow((value) => !value)}
      />

      <PasswordField
        label="Confirm password"
        value={confirm}
        onChange={setConfirm}
        show={show}
        onToggle={() => setShow((value) => !value)}
      />

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Activating..." : "Activate client portal"}
      </button>
    </form>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="label">
      {label}
      <div className="relative">
        <input
          className="field pr-12"
          type={show ? "text" : "password"}
          minLength={8}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-500"
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
