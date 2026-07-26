"use client";

import { Trash2 } from "lucide-react";

type Props = {
  label?: string;
  message?: string;
  compact?: boolean;
};

export function ConfirmDeleteButton({
  label = "Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  compact = false,
}: Props) {
  return (
    <button
      type="submit"
      className={`btn-danger ${compact ? "!px-3 !py-2" : ""}`}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      <Trash2 size={compact ? 14 : 15} />
      {!compact && label}
    </button>
  );
}
