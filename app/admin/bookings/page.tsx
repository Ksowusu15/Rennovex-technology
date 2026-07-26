import Link from "next/link";
import { CalendarDays, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { AdminToast } from "@/components/admin-toast";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { deleteBooking, updateBooking } from "./actions";

function localDateTime(value: Date) {
  const d = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
}

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ edit?: string; success?: string }> }) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const params = await searchParams;
  const items = await prisma.consultationBooking.findMany({ orderBy: { preferredDate: "asc" }, take: 200 });
  const edit = params.edit ? await prisma.consultationBooking.findUnique({ where: { id: params.edit } }) : null;

  return <div className="space-y-6">
    <AdminToast message={params.success} type="success" />
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow">Consultations</p><h1 className="mt-2 text-3xl font-bold">Bookings</h1><p className="mt-2 text-slate-600">Confirm, reschedule, complete, cancel, or delete consultation requests.</p></div><a href="/api/admin/exports?type=bookings" className="btn-secondary !py-2.5">Export CSV</a></div>

    {edit && <form action={updateBooking} className="admin-card grid gap-5"><input type="hidden" name="id" value={edit.id}/><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-700">Editing booking</p><h2 className="mt-1 text-xl font-bold text-slate-950">{edit.reference}</h2></div><Link href="/admin/bookings" className="btn-secondary !py-2">Cancel</Link></div><div className="grid gap-5 md:grid-cols-2"><label className="label">Name<input className="field" name="name" required defaultValue={edit.name}/></label><label className="label">Email<input className="field" type="email" name="email" required defaultValue={edit.email}/></label><label className="label">Phone<input className="field" name="phone" defaultValue={edit.phone || ""}/></label><label className="label">Company<input className="field" name="company" defaultValue={edit.company || ""}/></label><label className="label">Service<input className="field" name="service" defaultValue={edit.service || ""}/></label><label className="label">Preferred date and time<input className="field" type="datetime-local" name="preferredDate" required defaultValue={localDateTime(edit.preferredDate)}/></label><label className="label">Status<select className="field" name="status" defaultValue={edit.status}><option>PENDING</option><option>CONFIRMED</option><option>COMPLETED</option><option>CANCELLED</option></select></label></div><label className="label">Notes<textarea className="field min-h-28" name="notes" defaultValue={edit.notes || ""}/></label><button className="btn-primary w-fit">Save changes</button></form>}

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map(i=><article key={i.id} className="admin-card"><div className="flex items-start justify-between gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-50 text-violet-700"><CalendarDays size={20}/></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold">{i.status}</span></div><h2 className="mt-4 font-bold text-slate-900">{i.name}</h2><p className="mt-1 text-sm text-slate-500">{i.service||"General consultation"}</p><p className="mt-4 text-sm font-semibold text-slate-700">{new Date(i.preferredDate).toLocaleString("en-GH")}</p><a href={`mailto:${i.email}`} className="mt-3 block text-sm text-blue-700">{i.email}</a><p className="mt-3 text-xs text-slate-400">{i.reference} · {formatDate(i.createdAt)}</p><div className="mt-5 flex gap-2"><Link href={`/admin/bookings?edit=${i.id}`} className="btn-secondary !rounded-lg !px-3 !py-2"><Pencil size={14}/>Edit</Link><form action={deleteBooking}><input type="hidden" name="id" value={i.id}/><ConfirmDeleteButton message={`Delete booking ${i.reference}? This cannot be undone.`}/></form></div></article>)}{items.length===0&&<div className="admin-card md:col-span-2 xl:col-span-3 py-14 text-center"><CalendarDays className="mx-auto text-slate-300"/><p className="mt-3 text-slate-500">No consultation bookings yet.</p></div>}</div>
  </div>;
}
