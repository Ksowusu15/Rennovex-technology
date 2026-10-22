"use client";

import { formRequest } from "@/lib/form-request";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, Save, ShieldCheck } from "lucide-react";

export function ClientProfileForm({
  company,
  phone,
}: {
  company: string;
  phone: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setMessage("");
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (
      form.get("newPassword") &&
      form.get("newPassword") !== form.get("confirmPassword")
    ) {
      setError("Your new passwords do not match.");
      return;
    }
    if (form.get("newPassword") && !form.get("currentPassword")) {
      setError("Enter your current password to set a new password.");
      return;
    }
    setLoading(true);
    try {
      const response = await formRequest("/api/client-portal/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.get("company"),
          phone: form.get("phone"),
          currentPassword: form.get("currentPassword"),
          newPassword: form.get("newPassword"),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Unable to save changes.");
      for (const name of [
        "currentPassword",
        "newPassword",
        "confirmPassword",
      ]) {
        const input = formElement.elements.namedItem(name);
        if (input instanceof HTMLInputElement) input.value = "";
      }
      setMessage("Your account details have been updated.");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save changes. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit} aria-busy={loading} className="space-y-6">
      <fieldset disabled={loading} className="min-w-0">
        <legend className="sr-only">Contact details</legend>
        <div className="workspace-form-grid">
          <label className="label">
            Company
            <input
              className="field"
              name="company"
              autoComplete="organization"
              maxLength={150}
              defaultValue={company}
              placeholder="Your company (optional)"
            />
          </label>
          <label className="label">
            Phone number
            <input
              className="field"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={30}
              defaultValue={phone}
              placeholder="Your phone number (optional)"
            />
          </label>
        </div>
      </fieldset>
      <details className="workspace-details">
        <summary>
          <ShieldCheck size={18} />
          Change password<span className="ml-auto text-slate-400">+</span>
        </summary>
        <div className="workspace-form-section">
          <p className="mb-5 text-xs leading-6 text-slate-500">
            Use at least 8 characters, including uppercase, lowercase and a
            number. Changing your password signs out your other sessions.
          </p>
          <fieldset disabled={loading} className="grid min-w-0 gap-4">
            <legend className="sr-only">New password</legend>
            {[
              {
                name: "currentPassword",
                label: "Current password",
                complete: "current-password",
              },
              {
                name: "newPassword",
                label: "New password",
                complete: "new-password",
              },
              {
                name: "confirmPassword",
                label: "Confirm new password",
                complete: "new-password",
              },
            ].map((input) => (
              <label key={input.name} className="label">
                {input.label}
                <input
                  className="field"
                  type={showPassword ? "text" : "password"}
                  name={input.name}
                  autoComplete={input.complete}
                  minLength={input.name === "currentPassword" ? undefined : 8}
                  maxLength={128}
                />
              </label>
            ))}
            <button
              type="button"
              className="workspace-text-link w-fit"
              aria-pressed={showPassword}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPassword ? "Hide passwords" : "Show passwords"}
            </button>
          </fieldset>
        </div>
      </details>
      {message && (
        <p role="status" className="workspace-callout" data-tone="success">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="workspace-callout" data-tone="warning">
          {error}
        </p>
      )}
      <button className="btn-primary" disabled={loading}>
        {loading ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Save size={16} />
        )}
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
