"use client";

import { useState } from "react";
import { CheckCircle2, 
  LoaderCircle, 
  Send } from "lucide-react";

type SubmissionState = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [state, setState] = useState<SubmissionState>("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    setState("loading");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Unable to send message");
      }

      formElement.reset();
      setState("success");
    } catch (error) {
      console.error("Contact form submission failed:", 
        error);
      setState("error");
    }
  }

  return (
    <form 
      onSubmit={submit} 
      className="glass rounded-3xl p-6 sm:p-8" 
      aria-busy={state === "loading"}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name
          
          <input 
            className="field" 
            name="name" 
            required 
            minLength={2} 
            disabled={state === "loading"} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          
          <input 
            className="field" 
            name="email" 
            type="email" 
            required 
            disabled={state === "loading"} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Phone
          
          <input 
            className="field" 
            name="phone" 
            type="tel" 
            disabled={state === "loading"} />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Project type
          
          <select 
            className="field" 
            name="projectType" 
            defaultValue="" 
            disabled={state === "loading"}>
            <option 
              value="" 
              disabled>Select a service</option>
            <option>Website Development</option>
            <option>Custom Software</option>
            <option>UI/UX Design</option>
            <option>Graphic Design</option>
            <option>IT Consulting</option>
          </select>
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
        Tell us about your project
        
        <textarea
          className="field min-h-40 resize-y"
          name="message"
          required
          minLength={10}
          disabled={state === "loading"}
        />
      </label>

      <button
        type="submit"
        disabled={state === "loading"}
        className={`
  btn-primary mt-6 flex min-h-12 w-full items-center justify-center gap-2
  disabled:cursor-not-allowed disabled:opacity-75 sm:w-auto sm:min-w-44
`}
      >
        {state === "loading" ? (
          <>
            <LoaderCircle 
              className="animate-spin" 
              size={18} 
              aria-hidden="true" />
            Sending message...
          </>
        ) : state === "success" ? (
          <>
            <CheckCircle2 
              size={18} 
              aria-hidden="true" />
            Message sent
          </>
        ) : (
          <>
            Send Message
            <Send 
              size={17} 
              aria-hidden="true" />
          </>
        )}
      </button>

      <div 
        aria-live="polite" 
        aria-atomic="true">
        {state === "success" && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <CheckCircle2 
              className="mt-0.5 shrink-0" 
              size={19} />
            <div>
              <p className="font-semibold">Message sent successfully</p>
              <p className="mt-0.5 text-emerald-700">Thank you for contacting Rennovex. We will respond as soon as possible.</p>
            </div>
          </div>
        )}
        {state === "error" && (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p className="font-semibold">Your message could not be sent.</p>
            <p className="mt-0.5 text-red-700">Please check your connection and try again.</p>
          </div>
        )}
      </div>
    </form>
  );
}
