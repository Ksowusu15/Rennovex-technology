"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteAdminUser } from "@/app/admin/users/actions";

type DeleteUserFormProps = {
  userId: string;
  userName: string;
  disabled?: boolean;
};

export function DeleteUserForm({
  userId,
  userName,
  disabled = false,
}: DeleteUserFormProps) {
  const [confirming, setConfirming] = useState(false);

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        className={`
  inline-flex w-full items-center justify-center gap-2 whitespace-nowrap
  rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-400
  disabled:cursor-not-allowed
`}
        title="You cannot delete your own account"
      >
        <Trash2 size={15} />
        Delete
      </button>
    );
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`
  inline-flex w-full items-center justify-center gap-2 whitespace-nowrap
  rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700
  transition hover:bg-red-100
`}
      >
        <Trash2 size={15} />
        Delete
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:col-span-2">
      <p className="text-xs font-semibold leading-5 text-red-800">
        Delete 
        {userName}
        ? This permanently removes the account and its active
        sessions. This action cannot be undone.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <form action={deleteAdminUser}>
          <input 
            type="hidden" 
            name="id" 
            value={userId} />
          <button className="w-full rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700">
            Yes, delete
          </button>
        </form>
      </div>
    </div>
  );
}
