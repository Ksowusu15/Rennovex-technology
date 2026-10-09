"use client";

import { formRequest } from "@/lib/form-request";

import { FormEvent, useState } from "react";

export function ClientProfileForm({
  company,
  phone,
}: {
  company: string;
  phone: string;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setMessage("");
    setError("");
    setLoading(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    try {
      const response = await formRequest("/api/client-portal/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company: form.get("company"),
          phone: form.get("phone"),
          currentPassword: form.get("currentPassword"),
          newPassword: form.get("newPassword"),
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        setError(data.error ?? "Unable to save changes.");
        return;
      }

      for (const name of ["currentPassword", "newPassword"]) {
        const input = formElement.elements.namedItem(name);
        if (input instanceof HTMLInputElement) input.value = "";
      }
      setMessage("Your profile has been updated.");
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
    <form onSubmit={submit} aria-busy={loading} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="label">
          Company
          <input className="field" name="company" defaultValue={company} />
        </label>
        <label className="label">
          Phone
          <input
            className="field"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={phone}
          />
        </label>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h2 className="font-bold text-slate-950">Change password</h2>
        <p className="mt-1 text-sm text-slate-500">
          Use at least 8 characters with uppercase, lowercase and a number. Leave
          both fields empty to keep your password.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="label">
            Current password
            <input
              className="field"
              name="currentPassword"
              autoComplete="current-password"
              type="password"
            />
          </label>
          <label className="label">
            New password
            <input
              className="field"
              name="newPassword"
              autoComplete="new-password"
              type="password"
              minLength={8}
            />
          </label>
        </div>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button className="btn-primary" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
