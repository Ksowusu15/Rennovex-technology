"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { SiteLogo } from "@/components/site-logo";

type ChatItem = {
  sender: "ASSISTANT" | "VISITOR";
  content: string;
};

type Mode = "chat" | "quote" | "booking";

const starter: ChatItem = {
  sender: "ASSISTANT",
  content:
    "Hello! I’m Rennovex Assistant. I can help you choose a service, request a quote, book a consultation, or connect with our team. What are you planning to build?",
};

export function RennovexAssistant() {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");
  const [messages, setMessages] =
    useState<ChatItem[]>([starter]);
  const [sessionId, setSessionId] =
    useState<string>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: reduceMotion 
        ? "auto" 
        : "smooth",
    });
  }, [messages, 
    mode, 
    reduceMotion]);

  async function send(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const message = String(
      data.get("message") 
        || "",
    ).trim();

    if (!message 
      || loading) {
      return;
    }

    setMessages((current) => [
      ...current,
      {
        sender: "VISITOR",
        content: message,
      },
    ]);

    form.reset();
    setLoading(true);

    try {
      const response = await fetch(
        "/api/assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            message,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setSessionId(result.sessionId);

      setMessages((current) => [
        ...current,
        {
          sender: "ASSISTANT",
          content: result.reply,
        },
      ]);

      if (result.action) {
        setMode(result.action);
      }
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          sender: "ASSISTANT",
          content:
            error instanceof Error
              ? error.message
              : "Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function submitLead(
    event: FormEvent<HTMLFormElement>,
    kind: "quote" | "booking",
  ) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const form = event.currentTarget;
    const payload = Object.fromEntries(
      new FormData(form),
    );

    try {
      const response = await fetch(
        kind === "quote"
          ? "/api/quotes"
          : "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setStatus(
        `Submitted successfully. Reference: ${result.reference}`,
      );

      form.reset();

      setMessages((current) => [
        ...current,
        {
          sender: "ASSISTANT",
          content:
            `Your ${
              kind === "quote"
                ? "quote request"
                : "consultation request"
            } has been received. Reference: ${
              result.reference
            }. Our team will follow up.`,
        },
      ]);

      setTimeout(() => {
        setMode("chat");
      }, 1800);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div
        className={`
  group fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-3 z-40
  sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:left-6
  lg:bottom-7 lg:left-7
`}
      >
        <AnimatePresence>
          {!open && (
            <motion.div
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      x: -10,
                      scale: 0.96,
                    }
              }
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
              }}
              transition={{
                duration: 0.28,
              }}
              className="relative"
            >
              <div
                className={`
  pointer-events-none absolute bottom-full left-0 mb-3 hidden
  whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2
  text-xs font-semibold text-slate-700 opacity-0 shadow-xl transition-all
  duration-300 group-hover:-translate-y-1 group-hover:opacity-100 lg:block
`}
              >
                Need help? Ask Rennovex
              </div>

              <motion.button
                type="button"
                onClick={() => setOpen(true)}
                whileHover={
                  reduceMotion
                    ? undefined
                    : {
                        y: -3,
                        scale: 1.035,
                      }
                }
                whileTap={{
                  scale: 0.96,
                }}
                className={`
  relative grid h-14 w-14 place-items-center rounded-full bg-[#061b46] p-2
  text-white shadow-[0_16px_38px_rgba(6,27,70,0.30)] ring-1 ring-white/20
  sm:h-16 sm:w-16
`}
                aria-label="Open Rennovex Assistant"
              >
                <motion.span
                  aria-hidden="true"
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          rotate: 360,
                        }
                  }
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className={`
  absolute -inset-1 rounded-full
  bg-[conic-gradient(from_0deg,transparent_10%,#38bdf8_45%,#2563eb_72%,transparent_92%)]
  opacity-90
`}
                />

                <span
                  className="
                    absolute inset-[2px]
                    rounded-full bg-[#061b46]
                  "
                />

                <span
                  className={`
  relative z-10 grid h-11 w-11 place-items-center rounded-xl bg-white
  sm:h-12 sm:w-12
`}
                >
                  <SiteLogo compact />
                </span>

                <span
                  className={`
  absolute right-0 top-0 z-20 h-3.5 w-3.5 rounded-full border-2
  border-white bg-emerald-500
`}
                  aria-hidden="true"
                />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close assistant"
              onClick={() => setOpen(false)}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className={`
  fixed inset-0 z-[70] bg-slate-950/30 backdrop-blur-[2px]
  sm:bg-slate-950/20
`}
            />

            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Rennovex Assistant"
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      y: 32,
                      x: -8,
                      scale: 0.965,
                    }
              }
              animate={{
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 22,
                x: -6,
                scale: 0.975,
              }}
              transition={{
                type: "spring",
                stiffness: 310,
                damping: 29,
                mass: 0.78,
              }}
              className={`
  fixed bottom-3 left-3 right-3 z-[80] flex max-h-[calc(100dvh-1.5rem)]
  flex-col overflow-hidden rounded-[1.65rem] border border-slate-200/90
  bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)] sm:bottom-6 sm:left-6
  sm:right-auto sm:max-h-[min(720px,calc(100dvh-3rem))] sm:w-[400px]
  lg:bottom-7 lg:left-7 lg:w-[420px]
`}
            >
              <header
                className={`
  relative overflow-hidden bg-gradient-to-br from-[#061b46] via-[#0a2c69]
  to-blue-700 px-4 py-4 text-white
`}
              >
                <div
                  aria-hidden="true"
                  className={`
  absolute -right-10 -top-12 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl
`}
                />

                <div
                  className="
                    relative flex items-center
                    justify-between gap-3
                  "
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`
  grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white
  shadow-lg ring-1 ring-white/20
`}
                    >
                      <SiteLogo compact />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-bold">
                          Rennovex Assistant
                        </p>

                        <span
                          className={`
  h-2 w-2 shrink-0 rounded-full bg-emerald-400
`}
                        />
                      </div>

                      <p className="text-xs text-blue-100">
                        Digital project advisor
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className={`
  grid h-9 w-9 place-items-center rounded-xl text-blue-100 transition-all
  duration-200 hover:bg-white/10 hover:text-white
`}
                      aria-label="Minimize assistant"
                      title="Minimize"
                    >
                      <Minimize2 size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className={`
  grid h-9 w-9 place-items-center rounded-xl text-blue-100 transition-all
  duration-200 hover:bg-white/10 hover:text-white
`}
                      aria-label="Close assistant"
                      title="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </header>

              <div
                className={`
  flex gap-2 overflow-x-auto border-b border-slate-100 bg-white px-4 py-3
  text-xs font-bold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
`}
              >
                {[
                  ["chat", 
                    "Chat"],
                  ["quote", 
                    "Request a quote"],
                  ["booking", 
                    "Book consultation"],
                ].map(([value, label]) => {
                  const active = mode === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setMode(value as Mode)
                      }
                      className={`
                        shrink-0 rounded-full
                        px-3.5 py-2
                        transition-all duration-250
                        ${
                          active
                            ? "bg-blue-700 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:-translate-y-0.5 hover:bg-blue-50 hover:text-blue-700"
                        }
                      `}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {mode === "chat" ? (
                <>
                  <div
                    className={`
  min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50/80 px-4 py-4
  sm:min-h-[320px]
`}
                  >
                    {messages.map(
                      (item, 
                        index) => (
                        <motion.div
                          key={`${item.sender}-${index}`}
                          initial={
                            reduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  y: 10,
                                  scale: 0.985,
                                }
                          }
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          transition={{
                            duration: 0.28,
                          }}
                          className={`
                            flex gap-2
                            ${
                              item.sender === "VISITOR"
                                ? "justify-end"
                                : "justify-start"
                            }
                          `}
                        >
                          {item.sender ===
                            "ASSISTANT" && (
                            <div
                              className={`
  grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-100
  text-blue-700
`}
                            >
                              <Sparkles size={15} />
                            </div>
                          )}

                          <div
                            className={`
                              max-w-[82%]
                              rounded-2xl px-3.5 py-3
                              text-sm leading-6
                              ${
                                item.sender ===
                                "VISITOR"
                                  ? "rounded-br-md bg-blue-700 text-white shadow-sm"
                                  : "rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm"
                              }
                            `}
                          >
                            {item.content}
                          </div>
                        </motion.div>
                      ),
                    )}

                    <AnimatePresence>
                      {loading && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 6,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          exit={{
                            opacity: 0,
                          }}
                          className={`
  flex items-center gap-2 text-sm text-slate-500
`}
                        >
                          <Loader2
                            className="animate-spin"
                            size={16}
                          />
                          Rennovex Assistant is typing…
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={bottomRef} />
                  </div>

                  <form
                    onSubmit={send}
                    className={`
  flex gap-2 border-t border-slate-200 bg-white p-3
`}
                  >
                    <input
                      name="message"
                      className="field !py-2.5"
                      placeholder="Ask about a project or service…"
                      maxLength={1200}
                    />

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={
                        reduceMotion
                          ? undefined
                          : {
                              y: -2,
                              scale: 1.03,
                            }
                      }
                      whileTap={{
                        scale: 0.96,
                      }}
                      className={`
  grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-700
  text-white shadow-sm transition-colors hover:bg-blue-800
  disabled:opacity-50
`}
                      aria-label="Send"
                    >
                      <Send size={18} />
                    </motion.button>
                  </form>
                </>
              ) : mode === "quote" ? (
                <LeadForm
                  kind="quote"
                  loading={loading}
                  status={status}
                  onSubmit={(event) =>
                    submitLead(event, 
                      "quote")
                  }
                />
              ) : (
                <LeadForm
                  kind="booking"
                  loading={loading}
                  status={status}
                  onSubmit={(event) =>
                    submitLead(event, 
                      "booking")
                  }
                />
              )}
            </motion.section>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function LeadForm({
  kind,
  loading,
  status,
  onSubmit,
}: {
  kind: "quote" | "booking";
  loading: boolean;
  status: string;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="
        min-h-0 flex-1
        space-y-3 overflow-y-auto p-4
      "
    >
      <div className="rounded-2xl bg-blue-50 p-4">
        <div
          className="
            flex items-center gap-2
            font-bold text-blue-900
          "
        >
          {kind === "quote" ? (
            <Sparkles size={18} />
          ) : (
            <CalendarDays size={18} />
          )}

          {kind === "quote"
            ? "Project quote request"
            : "Consultation booking"}
        </div>

        <p
          className="
            mt-1 text-sm leading-6
            text-blue-700
          "
        >
          Complete the details below and the
          Rennovex team will follow up.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          className="
            field col-span-2
            sm:col-span-1
          "
          name="name"
          placeholder="Full name"
          required
        />

        <input
          className="
            field col-span-2
            sm:col-span-1
          "
          name="company"
          placeholder="Company"
        />

        <input
          className="field col-span-2"
          name="email"
          type="email"
          placeholder="Email address"
          required
        />

        <input
          className="field col-span-2"
          name="phone"
          placeholder="Phone number"
        />
      </div>

      <select
        className="field"
        name="service"
        required
      >
        <option value="">
          Select a service
        </option>
        <option>Business Website</option>
        <option>E-commerce Website</option>
        <option>Custom Software</option>
        <option>UI/UX & Branding</option>
        <option>IT Consulting</option>
      </select>

      {kind === "quote" ? (
        <>
          <select
            className="field"
            name="budget"
          >
            <option value="">
              Estimated budget
            </option>
            <option>Below GHS 5,000</option>
            <option>GHS 5,000 – 15,000</option>
            <option>GHS 15,000 – 40,000</option>
            <option>Above GHS 40,000</option>
          </select>

          <input
            className="field"
            name="timeline"
            placeholder="Preferred timeline"
          />

          <textarea
            className="field min-h-28"
            name="requirements"
            placeholder="Describe the project and required features"
            required
            minLength={10}
          />
        </>
      ) : (
        <>
          <label className="label">
            Preferred date and time

            
            <input
              className="field"
              name="preferredDate"
              type="datetime-local"
              required
            />
          </label>

          <textarea
            className="field min-h-24"
            name="notes"
            placeholder="What would you like to discuss?"
          />
        </>
      )}

      {status && (
        <div
          className={`
            rounded-xl px-3 py-2 text-sm
            ${
              status.startsWith("Submitted")
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }
          `}
        >
          {status}
        </div>
      )}

      <button
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? (
          <Loader2
            className="animate-spin"
            size={17}
          />
        ) : kind === "quote" ? (
          <CheckCircle2 size={17} />
        ) : (
          <CalendarDays size={17} />
        )}

        {loading
          ? "Submitting…"
          : kind === "quote"
            ? "Submit quote request"
            : "Request consultation"}
      </button>
    </form>
  );
}
