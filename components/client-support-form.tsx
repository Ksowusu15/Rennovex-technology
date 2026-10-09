"use client";

import { formRequest } from "@/lib/form-request";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";

export function ClientSupportForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
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

      setLoading(false);
      if (response.ok) {
        form.reset();
        setMessage("Support request sent successfully.");
        return;
      }
      setMessage("Unable to send your request. Please try again.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} aria-busy={loading} className="surface p-6">
      <div className="space-y-4">
        <label className="label">
          Subject
          <input
            className="field"
            name="subject"
            minLength={3}
            maxLength={120}
            disabled={loading}
            required
          />
        </label>
        <label className="label">
          Priority
          <select
            className="field"
            name="priority"
            disabled={loading}
            defaultValue="Normal"
          >
            <option>Low</option>
            <option>Normal</option>
            <option>High</option>
          </select>
        </label>
        <label className="label">
          How can we help?
          <textarea
            className="field min-h-36"
            name="message"
            minLength={10}
            maxLength={4000}
            disabled={loading}
            required
          />
        </label>
      </div>
      <button className="btn-primary mt-5" disabled={loading}>
        {loading ? (
          <Loader2 className="animate-spin" size={17} />
        ) : (
          <Send size={17} />
        )}
        {loading ? "Sending…" : "Send request"}
      </button>
      {message && (
        <p role="status" className="mt-4 text-sm text-slate-600">
          {message}
        </p>
      )}
    </form>
  );
}
