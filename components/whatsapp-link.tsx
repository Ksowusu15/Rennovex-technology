import { MessageCircle } from "lucide-react";

const WHATSAPP_NUMBER = "233207290092";
const DEFAULT_MESSAGE =
  "Hello Rennovex Technology, I would like to discuss a project.";

type WhatsAppLinkProps = {
  message?: string;
  compact?: boolean;
  className?: string;
};

export function WhatsAppLink({
  message = DEFAULT_MESSAGE,
  compact = false,
  className = "",
}: WhatsAppLinkProps) {
  const href =
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Rennovex on WhatsApp (opens in a new tab)"
      className={[
        compact
          ? "inline-flex items-center gap-2 font-semibold text-green-800"
          : [
              "inline-flex min-h-11 items-center justify-center gap-2",
              "rounded-xl bg-green-700 px-5 py-3 text-sm font-bold text-white",
              "hover:bg-green-800",
            ].join(" "),
        "transition-colors focus-visible:outline focus-visible:outline-2",
        "focus-visible:outline-offset-4 focus-visible:outline-green-700",
        className,
      ].join(" ")}
    >
      <MessageCircle size={18} aria-hidden="true" />
      {compact ? "WhatsApp: 020 729 0092" : "Chat on WhatsApp"}
    </a>
  );
}
