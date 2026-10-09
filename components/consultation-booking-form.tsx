"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { formRequest } from "@/lib/form-request";
import { bookingDateToISO, localDateInputValue } from "@/lib/booking-date";

type SubmissionState = "idle" | "loading" | "success" | "error";

const services = [
  "Website Development",
  "E-commerce Development",
  "Custom Software Development",
  "UI/UX Design",
  "Graphic Design & Branding",
  "IT Solutions & Consulting",
] as const;

const labelClass = "grid gap-2 text-sm font-semibold text-slate-700";

export function ConsultationBookingForm() {
  const [state, setState] = useState<SubmissionState>("idle");
  const [reference, setReference] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [dateError, setDateError] = useState("");
  const [today, setToday] = useState("");
  const [timeZone, setTimeZone] = useState("your local time");
  const feedbackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setToday(localDateInputValue());
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    if (state === "success" || state === "error") {
      feedbackRef.current?.focus();
    }
  }, [state]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const preferredDate = bookingDateToISO(
      String(data.get("date") || ""),
      String(data.get("time") || ""),
    );
    if (!preferredDate || new Date(preferredDate).getTime() <= Date.now()) {
      setDateError("Choose a date and time in the future.");
      form.querySelector<HTMLInputElement>('[name="date"]')?.focus();
      return;
    }

    setDateError("");
    setErrorMessage("");
    setState("loading");
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      service: String(data.get("service") || ""),
      preferredDate,
      notes: String(data.get("notes") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      company: String(data.get("company") || "").trim(),
    };

    try {
      const response = await formRequest("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to send your request. Try again.");
      }
      setReference(result.reference || "");
      setState("success");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Please try again.",
      );
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div
        ref={feedbackRef}
        tabIndex={-1}
        role="status"
        className="rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm sm:p-10"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-800">
          <CheckCircle2 size={28} />
        </span>
        <h2 className="mt-6 text-2xl font-bold text-slate-950">
          Your request is received.
        </h2>
        <p className="mt-3 leading-7 text-slate-600">
          Our team will contact you to confirm a suitable time. Your appointment
          is not confirmed yet.
        </p>
        {reference && (
          <p className="mt-5 break-all rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
            Your reference: <strong>{reference}</strong>
          </p>
        )}
        <a href="/" className="enterprise-btn-primary mt-6 justify-center">
          Return to website
          <ArrowRight size={17} />
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      aria-busy={state === "loading"}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
    >
      <div className="mb-7 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <CalendarDays size={22} />
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            Request a consultation
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Name, email, date and time are required. Everything else is optional.
        </p>
      </div>

      <fieldset disabled={state === "loading"} className="min-w-0 space-y-5">
        <legend className="sr-only">Consultation details</legend>
        <label className={labelClass}>
          Full name <span className="sr-only">(required)</span>
          <input
            className="field"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label className={labelClass}>
          Email address <span className="sr-only">(required)</span>
          <input
            className="field"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            maxLength={150}
          />
          <span className="text-xs font-normal text-slate-500">
            We’ll use this to contact you about your request.
          </span>
        </label>
        <label className={labelClass}>
          What do you need help with?
          <select className="field" name="service" defaultValue="">
            <option value="">Not sure yet, let’s discuss</option>
            {services.map((service) => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </label>

        <div className="border-t border-slate-100 pt-5">
          <h3 className="text-sm font-bold text-slate-950">Your preferred time</h3>
          <p id="consultation-time-help" className="mt-1 text-xs leading-5 text-slate-500">
            Times are in {timeZone}. Choose a time and we’ll confirm availability.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Date <span className="sr-only">(required)</span>
              <input
                className="field min-w-0"
                name="date"
                type="date"
                required
                min={today || undefined}
                aria-invalid={Boolean(dateError)}
                aria-describedby="consultation-time-help consultation-date-error"
                onChange={() => setDateError("")}
              />
            </label>
            <label className={labelClass}>
              Time <span className="sr-only">(required)</span>
              <input
                className="field min-w-0"
                name="time"
                type="time"
                required
                aria-invalid={Boolean(dateError)}
                aria-describedby="consultation-time-help consultation-date-error"
                onChange={() => setDateError("")}
              />
            </label>
          </div>
          <p id="consultation-date-error" role="alert" className="mt-2 text-sm text-red-700">
            {dateError}
          </p>
        </div>

        <label className={labelClass}>
          A little about your project (optional)
          <textarea
            className="field min-h-24 resize-y"
            name="notes"
            maxLength={2000}
            placeholder="A sentence or two is enough."
          />
        </label>
        <details className="rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-600">
            Add phone or company details (optional)
          </summary>
          <div className="mt-4 space-y-4">
            <label className={labelClass}>
              Phone number (optional)
              <input
                className="field"
                name="phone"
                type="tel"
                autoComplete="tel"
                maxLength={30}
              />
            </label>
            <label className={labelClass}>
              Company (optional)
              <input
                className="field"
                name="company"
                autoComplete="organization"
                maxLength={150}
              />
            </label>
          </div>
        </details>
      </fieldset>

      {state === "error" && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {errorMessage} Your details are still here.
        </div>
      )}
      <button
        type="submit"
        disabled={state === "loading"}
        className="enterprise-btn-primary mt-6 min-h-12 w-full justify-center disabled:opacity-70"
      >
        {state === "loading" ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Sending request…
          </>
        ) : (
          <>
            Request consultation
            <ArrowRight size={17} />
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs leading-5 text-slate-500">
        We’ll review your request before confirming a time.
      </p>
    </form>
  );
}
