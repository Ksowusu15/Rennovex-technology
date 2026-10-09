"use client";

import { formRequest } from "@/lib/form-request";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type SubmissionState = "idle" | "loading" | "success" | "error";

const services = [
  "Website Development",
  "E-commerce Development",
  "Custom Software Development",
  "UI/UX Design",
  "Graphic Design & Branding",
  "IT Solutions & Consulting",
] as const;

export function ContactForm() {
  const searchParams = useSearchParams();

  const [state, setState] = useState<SubmissionState>("idle");

  const requestedService = searchParams.get("service") || "";

  const requestedPackage = searchParams.get("package") || "";

  const suppliedMessage = searchParams.get("message") || "";

  const initialMessage = useMemo(() => {
    if (suppliedMessage) {
      return suppliedMessage;
    }

    if (requestedService && requestedPackage) {
      return [
        `Hello Rennovex, I am interested in the ${requestedPackage} package for ${requestedService}.`,
        "",
        "Please contact me so we can discuss the project requirements and next steps.",
        "",
        "Additional details:",
      ].join("\n");
    }

    if (requestedService) {
      return [
        `Hello Rennovex, I am interested in ${requestedService}.`,
        "",
        "I would like to discuss my requirements and the next steps.",
        "",
        "Additional details:",
      ].join("\n");
    }

    return "";
  }, [requestedPackage, requestedService, suppliedMessage]);

  const [errorMessage, setErrorMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = Object.fromEntries(formData.entries());

    setState("loading");
    setErrorMessage("");

    try {
      const response = await formRequest("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to send message. Please try again.");
      }

      formElement.reset();
      setState("success");
    } catch (error) {
      console.error("Contact form submission failed:", error);
      setErrorMessage(error instanceof Error ? error.message : "Please try again.");
      setState("error");
    }
  }

  return (
    <form
      onSubmit={submit}
      className="glass rounded-3xl p-6 sm:p-8"
      aria-busy={state === "loading"}
    >
      {requestedPackage && (
        <div
          className={`
            mb-6 rounded-2xl
            border border-blue-200
            bg-blue-50 p-4
          `}
        >
          <p
            className={`
              text-xs font-bold
              uppercase tracking-[0.14em]
              text-blue-700
            `}
          >
            Package enquiry
          </p>

          <p
            className={`
              mt-1 text-sm font-semibold
              text-slate-900
            `}
          >
            {requestedPackage}
            {requestedService ? ` · ${requestedService}` : ""}
          </p>

          <p
            className={`
              mt-1 text-xs
              leading-5 text-slate-600
            `}
          >
            We have prepared the message below. Add your details or replace it with
            your own message if you prefer.
          </p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Name
          <input
            className="field"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            disabled={state === "loading"}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Email
          <input
            className="field"
            name="email"
            maxLength={150}
            autoComplete="email"
            type="email"
            required
            disabled={state === "loading"}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Phone
          <input
            className="field"
            name="phone"
            maxLength={30}
            autoComplete="tel"
            type="tel"
            disabled={state === "loading"}
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Project type
          <select
            className="field"
            name="projectType"
            defaultValue={
              services.includes(requestedService as (typeof services)[number])
                ? requestedService
                : ""
            }
            disabled={state === "loading"}
          >
            <option value="" disabled>
              Select a service
            </option>

            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
        Tell us about your project
        <textarea
          key={initialMessage}
          className="field min-h-40 resize-y"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          defaultValue={initialMessage}
          placeholder="Tell us about your goals, requirements or the problem you want to solve."
          disabled={state === "loading"}
        />
      </label>

      <button
        type="submit"
        disabled={state === "loading"}
        className={`
          btn-primary mt-6 flex
          min-h-12 w-full
          items-center justify-center
          gap-2
          disabled:cursor-not-allowed
          disabled:opacity-75
          sm:w-auto sm:min-w-44
        `}
      >
        {state === "loading" ? (
          <>
            <LoaderCircle className="animate-spin" size={18} aria-hidden="true" />
            Sending message...
          </>
        ) : state === "success" ? (
          <>
            <CheckCircle2 size={18} aria-hidden="true" />
            Message sent
          </>
        ) : (
          <>
            Send Message
            <Send size={17} aria-hidden="true" />
          </>
        )}
      </button>

      <div aria-live="polite" aria-atomic="true">
        {state === "success" && (
          <div
            className={`
              mt-5 flex items-start
              gap-3 rounded-2xl
              border border-emerald-200
              bg-emerald-50 p-4
              text-sm text-emerald-800
            `}
          >
            <CheckCircle2 className="mt-0.5 shrink-0" size={19} />

            <div>
              <p className="font-semibold">Message sent successfully</p>

              <p className="mt-0.5 text-emerald-700">
                Thank you for contacting Rennovex. We will respond as soon as
                possible.
              </p>
            </div>
          </div>
        )}

        {state === "error" && (
          <div
            className={`
              mt-5 rounded-2xl
              border border-red-200
              bg-red-50 p-4
              text-sm text-red-800
            `}
          >
            <p className="font-semibold">Your message could not be sent.</p>

            <p className="mt-0.5 text-red-700">{errorMessage}</p>
          </div>
        )}
      </div>
    </form>
  );
}
