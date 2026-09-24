import Image from "next/image";
import Link from "next/link";
import { Pencil, 
  Plus, 
  Trash2 } from "lucide-react";

import { FormActions } from "@/components/admin-form";
import { ServiceImageField } from "@/components/service-image-field";
import { prisma } from "@/lib/prisma";

import { deleteService, 
  saveService } from "./actions";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    edit?: string;
    new?: string;
    error?: string;
  }>;
}) {
  const q = await searchParams;

  const items = await prisma.service.findMany({
    orderBy: { order: "asc" },
  });

  const edit = q.edit
    ? await prisma.service.findUnique({
        where: { id: q.edit },
      })
    : null;

  const show = Boolean(q.new) 
    || Boolean(edit);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Manage</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">
            Services
          </h1>
        </div>

        <Link 
          href="?new=1" 
          className="btn-primary">
          <Plus size={16} />
          Add Service
        </Link>
      </div>

      {q.error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {q.error}
        </div>
      )}

      {show && (
        <form
          action={saveService}
          className="admin-card mt-7 grid gap-5"
        >
          <input 
            type="hidden" 
            name="id" 
            value={edit?.id 
              || ""} />

          <div className="grid gap-5 md:grid-cols-2">
            <label className="label">
              Title
              
              <input
                className="field"
                name="title"
                required
                defaultValue={edit?.title}
              />
            </label>

            <label className="label">
              Slug
              
              <input
                className="field"
                name="slug"
                defaultValue={edit?.slug}
              />
            </label>
          </div>

          <ServiceImageField currentImage={edit?.imageUrl} />

          <label className="label">
            Summary
            
            <input
              className="field"
              name="summary"
              required
              defaultValue={edit?.summary}
            />
          </label>

          <label className="label">
            Description
            
            <textarea
              className="field min-h-28"
              name="description"
              required
              defaultValue={edit?.description}
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="label">
              Benefits (comma separated)
              
              <input
                className="field"
                name="benefits"
                defaultValue={edit?.benefits.join(", ")}
              />
            </label>

            <label className="label">
              Technologies
              
              <input
                className="field"
                name="technologies"
                defaultValue={edit?.technologies.join(", ")}
              />
            </label>

            <label className="label">
              Icon
              
              <select
                className="field"
                name="icon"
                defaultValue={edit?.icon 
                  || "Code2"}
              >
                <option>Globe</option>
                <option>Code2</option>
                <option>PanelsTopLeft</option>
                <option>Palette</option>
                <option>ServerCog</option>
              </select>
            </label>

            <label className="label">
              Display order
              
              <input
                className="field"
                name="order"
                type="number"
                defaultValue={edit?.order 
                  || 0}
              />
            </label>

            <label className="label">
              Status
              
              <select
                className="field"
                name="status"
                defaultValue={edit?.status 
                  || "PUBLISHED"}
              >
                <option>DRAFT</option>
                <option>PUBLISHED</option>
                <option>ARCHIVED</option>
              </select>
            </label>
          </div>

          <FormActions editing={Boolean(edit)} />
        </form>
      )}

      <div className="mt-7 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Status</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="flex min-w-[260px] items-center gap-3">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-[10px] font-semibold text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div>
                      <b className="text-slate-950">
                        {item.title}
                      </b>
                      <p className="mt-1 max-w-xl text-xs text-slate-500">
                        {item.summary}
                      </p>
                    </div>
                  </div>
                </td>

                <td>
                  {item.status}
                </td>
                <td>
                  {item.order}
                </td>

                <td>
                  <div className="flex gap-2">
                    <Link
                      href={`?edit=${item.id}`}
                      className="btn-secondary !rounded-lg !px-3 !py-2"
                      aria-label={`Edit ${item.title}`}
                    >
                      <Pencil size={14} />
                    </Link>

                    <form action={deleteService}>
                      <input
                        type="hidden"
                        name="id"
                        value={item.id}
                      />
                      <button
                        className="btn-danger !px-3"
                        aria-label={`Delete ${item.title}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
