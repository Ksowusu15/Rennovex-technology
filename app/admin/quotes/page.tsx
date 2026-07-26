import Link from "next/link";
import { FileText, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { AdminToast } from "@/components/admin-toast";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { deleteQuote, updateQuote } from "./actions";

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ edit?: string; success?: string }> }) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const params = await searchParams;
  const items = await prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const edit = params.edit ? await prisma.quoteRequest.findUnique({ where: { id: params.edit } }) : null;

  return <div className="space-y-6">
    <AdminToast message={params.success} type="success" />
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="eyebrow">Sales pipeline</p><h1 className="mt-2 text-3xl font-bold">Quote requests</h1><p className="mt-2 text-slate-600">Review, update, qualify, and remove project enquiries.</p></div>
      <a href="/api/admin/exports?type=quotes" className="btn-secondary !py-2.5">Export CSV</a>
    </div>

    {edit && <form action={updateQuote} className="admin-card grid gap-5">
      <input type="hidden" name="id" value={edit.id}/>
      <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Editing</p><h2 className="mt-1 text-xl font-bold text-slate-950">{edit.reference}</h2></div><Link href="/admin/quotes" className="btn-secondary !py-2">Cancel</Link></div>
      <div className="grid gap-5 md:grid-cols-2"><label className="label">Client name<input className="field" name="name" required defaultValue={edit.name}/></label><label className="label">Email<input className="field" type="email" name="email" required defaultValue={edit.email}/></label><label className="label">Phone<input className="field" name="phone" defaultValue={edit.phone || ""}/></label><label className="label">Company<input className="field" name="company" defaultValue={edit.company || ""}/></label><label className="label">Service<input className="field" name="service" required defaultValue={edit.service}/></label><label className="label">Budget<input className="field" name="budget" defaultValue={edit.budget || ""}/></label><label className="label">Timeline<input className="field" name="timeline" defaultValue={edit.timeline || ""}/></label><label className="label">Status<select className="field" name="status" defaultValue={edit.status}><option>NEW</option><option>CONTACTED</option><option>QUALIFIED</option><option>WON</option><option>LOST</option></select></label></div>
      <label className="label">Requirements<textarea className="field min-h-32" name="requirements" required defaultValue={edit.requirements}/></label>
      <button className="btn-primary w-fit">Save changes</button>
    </form>}

    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm"><table className="admin-table"><thead><tr><th>Reference</th><th>Client</th><th>Service</th><th>Budget</th><th>Status</th><th>Received</th><th>Actions</th></tr></thead><tbody>{items.map(i=><tr key={i.id}><td className="font-semibold text-blue-700">{i.reference}</td><td><p className="font-semibold text-slate-900">{i.name}</p><a href={`mailto:${i.email}`} className="text-xs text-blue-700">{i.email}</a></td><td>{i.service}</td><td>{i.budget||"Not stated"}</td><td>{i.status}</td><td>{formatDate(i.createdAt)}</td><td><div className="flex gap-2"><Link href={`/admin/quotes?edit=${i.id}`} className="btn-secondary !rounded-lg !px-3 !py-2" title="Edit quote"><Pencil size={14}/></Link><form action={deleteQuote}><input type="hidden" name="id" value={i.id}/><ConfirmDeleteButton compact message={`Delete quote ${i.reference}? This cannot be undone.`}/></form></div></td></tr>)}</tbody></table>{items.length===0&&<div className="py-14 text-center"><FileText className="mx-auto text-slate-300"/><p className="mt-3 text-slate-500">No quote requests yet.</p></div>}</div>
  </div>;
}
