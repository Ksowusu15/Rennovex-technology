"use client";

import { useState } from "react";
import { Loader2, 
  LogOut } from "lucide-react";

type LogoutButtonProps = {
  compact?: boolean;
  onBeforeLogout?: () => void;
};

export function LogoutButton({ compact = false, onBeforeLogout }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    if (loading) return;

    setLoading(true);
    setError("");
    onBeforeLogout?.();

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Unable to sign out");
      }

      // A full document navigation clears cached admin UI and prevents
      // protected data from remaining visible after the cookie is removed.
      window.location.replace("/admin/login?reason=signed-out");
    } catch (signOutError) {
      console.error("Sign out failed:", 
        signOutError);
      setError("Sign out failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={signOut}
        disabled={loading}
        className={
          compact
            ? "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            : "flex w-full items-center gap-3 rounded-xl px-3.5 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        }
      >
        {loading ? <Loader2 
          className="animate-spin" 
          size={compact 
            ? 17 
            : 18} /> : <LogOut size={compact 
            ? 17 
            : 18} />}
        {loading 
          ? "Signing out..." 
          : "Sign out"}
      </button>
      {error 
        && <p className="mt-2 px-3 text-xs font-medium text-red-700">
        {error}
      </p>}
    </div>
  );
}
