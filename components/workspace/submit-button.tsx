"use client";
import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
export function WorkspaceSubmit({
  children,
  pendingLabel = "Saving…",
  secondary = false,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  secondary?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={secondary ? "btn-secondary" : "btn-primary"}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending && (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      )}
      {pending ? pendingLabel : children}
    </button>
  );
}
