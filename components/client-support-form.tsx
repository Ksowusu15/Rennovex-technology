"use client";

import { formRequest } from "@/lib/form-request";
import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

export function ClientSupportForm() {
  const router = useRouter();
  const feedback = useRef<HTMLParagraphElement>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await formRequest("/api/client-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.get("subject"),
          message: data.get("message"),
          priority: data.get("priority"),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "We couldn’t send your request. Please try again.",
        );
      form.reset();
      setMessage(
        "Your request has been sent. You can follow its status in Your requests.",
      );
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to send your request. Please try again.",
      );
    } finally {
      setLoading(false);
      requestAnimationFrame(() => feedback.current?.focus());
    }
  }
  return (
    <form
      onSubmit={submit}
      aria-busy={loading}
      className="workspace-form-section"
    >
      <fieldset disabled={loading} className="grid min-w-0 gap-5">
        <legend className="sr-only">New support request</legend>
        <label className="label">
          Subject
          <input
            className="field"
            name="subject"
            minLength={3}
            maxLength={120}
            placeholder="What would you like help with?"
            required
          />
        </label>
        <label className="label">
          Priority
          <select className="field" name="priority" defaultValue="Normal">
            <option value="Low">Low · General question</option>
            <option value="Normal">Normal · Standard request</option>
            <option value="High">High · Blocking an important task</option>
          </select>
        </label>
        <label className="label">
          Your message
          <textarea
            className="field min-h-44 resize-y"
            name="message"
            minLength={10}
            maxLength={4000}
            placeholder="Tell us what happened, what you need and which project or invoice it relates to."
            required
          />
        </label>
      </fieldset>
      {(message || error) && (
        <p
          ref={feedback}
          tabIndex={-1}
          role={error ? "alert" : "status"}
          className="workspace-callout mt-5"
          data-tone={error ? "warning" : "success"}
        >
          {message && <CheckCircle2 size={17} className="mb-2" />}
          {error || message}
        </p>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-slate-500">All fields are required.</span>
        <button className="btn-primary" disabled={loading}>
          {loading ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
          {loading ? "Sending…" : "Send request"}
        </button>
      </div>
    </form>
  );
}
