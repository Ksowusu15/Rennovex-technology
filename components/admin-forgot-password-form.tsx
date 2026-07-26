"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Mail, Send, ShieldCheck } from "lucide-react";

export function AdminForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMessage("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(form.entries()))});
    const data = await res.json(); setMessage(data.message ?? "Check your email for the reset link."); setLoading(false);
  }
  return <div className="mx-auto w-full max-w-[460px]">
    <div className="mb-6 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-700 text-white shadow-xl shadow-blue-700/25"><ShieldCheck size={28}/></div><p className="mt-4 text-sm font-semibold text-slate-700">Rennovex Admin Portal</p></div>
    <form onSubmit={submit} className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/10 sm:p-8">
      <p className="eyebrow">Account recovery</p><h1 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">Forgot your password?</h1><p className="mt-2 text-sm leading-6 text-slate-600">Enter your administrator email and we will send a secure reset link valid for 10 minutes.</p>
      <label className="mt-7 grid gap-2 text-sm font-semibold text-slate-800">Admin email<span className="relative block"><Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18}/><input className="admin-auth-field pl-11 pr-4" name="email" type="email" autoComplete="email" placeholder="admin@rennovex.com" required/></span></label>
      {message && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
      <button disabled={loading} className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 hover:bg-blue-800 disabled:opacity-60">{loading?"Sending secure link...":"Send reset link"}<Send size={17}/></button>
      <Link href="/admin/login" className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700"><ArrowLeft size={16}/>Back to admin login</Link>
    </form></div>;
}
