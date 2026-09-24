import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { FormActions } from "@/components/admin-form";
import { TestimonialImageField } from "@/components/testimonial-image-field";
import { prisma } from "@/lib/prisma";
import { deleteTestimonial, saveTestimonial } from "./actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ edit?: string; new?: string }> }) {
  const q = await searchParams;
  const items = await prisma.testimonial.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  const edit = q.edit ? await prisma.testimonial.findUnique({ where: { id: q.edit } }) : null;
  const show = Boolean(q.new) || Boolean(edit);

  return <><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div><p className="eyebrow">Manage</p><h1 className="mt-3 text-3xl font-bold text-slate-950">Client Testimonials</h1></div>
    <Link href="?new=1" className="btn-primary"><Plus size={16}/>Add Testimonial</Link>
  </div>

  {show && <form action={saveTestimonial} className="admin-card mt-7 grid gap-5">
    <input type="hidden" name="id" value={edit?.id || ""}/>
    <div className="grid gap-5 md:grid-cols-2">
      <label className="label">Client name<input className="field" name="name" required defaultValue={edit?.name}/></label>
      <label className="label">Role / Company<input className="field" name="role" required defaultValue={edit?.role}/></label>
    </div>
    <TestimonialImageField currentImage={edit?.imageUrl}/>
    <label className="label">Testimonial<textarea className="field min-h-32" name="quote" required defaultValue={edit?.quote}/></label>
    <div className="grid gap-5 sm:grid-cols-3">
      <label className="label">Rating<select className="field" name="rating" defaultValue={edit?.rating || 5}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</select></label>
      <label className="label">Display order<input className="field" type="number" name="order" defaultValue={edit?.order || 0}/></label>
      <label className="label">Status<select className="field" name="status" defaultValue={edit?.status || "PUBLISHED"}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select></label>
    </div>
    <FormActions editing={Boolean(edit)}/>
  </form>}

  <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="admin-table">
    <thead><tr><th>Client</th><th>Status</th><th>Rating</th><th>Actions</th></tr></thead>
    <tbody>{items.map(item=><tr key={item.id}><td><div className="flex min-w-[250px] items-center gap-3">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-100">{item.imageUrl ? <Image src={item.imageUrl} alt={item.name} fill className="object-cover"/> : <div className="grid h-full place-items-center font-bold text-slate-400">{item.name.charAt(0).toUpperCase()}</div>}</div>
      <div><b className="text-slate-950">{item.name}</b><p className="text-xs text-slate-500">{item.role}</p></div>
    </div></td><td>{item.status}</td><td>{"★".repeat(item.rating)}</td><td><div className="flex gap-2">
      <Link href={`?edit=${item.id}`} className="btn-secondary !rounded-lg !px-3 !py-2"><Pencil size={14}/></Link>
      <form action={deleteTestimonial}><input type="hidden" name="id" value={item.id}/><button className="btn-danger !px-3"><Trash2 size={14}/></button></form>
    </div></td></tr>)}</tbody>
  </table></div></>;
}
