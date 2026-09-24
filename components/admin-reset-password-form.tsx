"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, 
  EyeOff, 
  KeyRound, 
  LockKeyhole } from "lucide-react";
export function AdminResetPasswordForm({token}:{token:string}) {
 const [show,setShow]=useState(false),[loading,setLoading]=useState(false),[error,setError]=useState(""),[done,setDone]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();
   setLoading(true);
   setError("");
   const f=new FormData(e.currentTarget);
   const password=String(f.get("password")
     ||""),confirm=String(f.get("confirmPassword")
     ||"");
   if(password!==confirm){setError("Passwords do not match.");
   setLoading(false);
   return;}
   const r=await fetch("/api/auth/reset-password",
   {method:"POST",
   headers:{"Content-Type":"application/json"},
   body:JSON.stringify({token,
   password})});
   const d=await r.json();
   if(!r.ok){setError(d.error
     ??"Unable to reset password.");
   setLoading(false);
   return;}
   setDone(true);
   setLoading(false);}
 if(done)return <div className="mx-auto max-w-[460px] rounded-[1.75rem] border border-emerald-200 bg-white p-8 text-center shadow-2xl">
   <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
   <KeyRound size={28}/>
 </div>
   <h1 className="mt-5 text-2xl font-bold text-slate-950">Password updated</h1>
   <p className="mt-2 text-sm text-slate-600">You can now sign in with your new administrator password.</p>
   <Link 
   href="/admin/login" 
   className="btn-primary mt-6 w-full">Return to admin login</Link>
 </div>;
 return <form 
   onSubmit={submit} 
   className={`
  mx-auto w-full max-w-[460px] rounded-[1.75rem] border border-slate-200
  bg-white p-5 shadow-2xl shadow-slate-950/10 sm:p-8
`}>
   <p className="eyebrow">Secure password reset</p>
   <h1 className="mt-3 text-2xl font-bold text-slate-950 sm:text-3xl">Create a new password</h1>
   <p className="mt-2 text-sm leading-6 text-slate-600">Use at least 8 characters. A longer unique password is recommended.</p>
   {["password",
   "confirmPassword"].map((name,
   i)=><label 
   key={name} 
   className="mt-5 grid gap-2 text-sm font-semibold text-slate-800">
     {i
     ?"Confirm new password"
     :"New password"}
   <span className="relative block">
     <LockKeyhole 
   className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" 
   size={18}/>
   <input 
   className="admin-auth-field px-11" 
   name={name} 
   type={show
     ?"text"
     :"password"} 
   autoComplete="new-password" 
   placeholder={i
     ?"Repeat your new password"
     :"Enter your new password"} 
   minLength={8} 
   required/>
   {i===0&&<button 
   type="button" 
   onClick={()=>setShow(!show)} 
   className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100">
     {show
     ?<EyeOff size={18}/>
     :<Eye size={18}/>}
   </button>}
   </span>
   </label>)}
   {error
     &&<p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
     {error}
   </p>}
   <button 
   disabled={loading} 
   className="btn-primary mt-6 min-h-12 w-full">
     {loading
     ?"Updating password..."
     :"Update admin password"}
   </button>
 </form>;
}
