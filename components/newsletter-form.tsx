"use client";

import { FormEvent, useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { formRequest } from "@/lib/form-request";

export function NewsletterForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setLoading(true);
    setMessage("");
    setFailed(false);

    try {
      const response = await formRequest("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to subscribe. Please try again.");
      }
      form.reset();
      setMessage("You’re subscribed. Thank you!");
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-4" aria-busy={loading}>
      <div className="flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Email address for newsletter updates</span>
          <input
            className={[
              "min-h-11 w-full rounded-xl border border-slate-700",
              "bg-slate-900 px-3 py-2.5 text-base text-white",
              "placeholder:text-slate-400 focus:border-blue-400",
            ].join(" ")}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email for updates"
            disabled={loading}
            required
          />
        </label>
        <button
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"
          disabled={loading}
          aria-label={loading ? "Subscribing" : "Subscribe to newsletter"}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          ) : (
            <Mail size={18} aria-hidden="true" />
          )}
        </button>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={
          failed ? "mt-2 text-sm text-red-300" : "mt-2 text-sm text-emerald-300"
        }
      >
        {message}
      </p>
    </form>
  );
}
