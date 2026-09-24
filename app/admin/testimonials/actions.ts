"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { deleteImage, 
  uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

const MAX = 8 * 1024 * 1024;
const TYPES = new Set(["image/jpeg", 
  "image/png", 
  "image/webp", 
  "image/avif"]);

export async function saveTestimonial(fd: FormData) {
  await requireRole(["SUPER_ADMIN", 
    "ADMIN", 
    "EDITOR"]);
  const id = String(fd.get("id") 
    || "");
  const existing = id 
    ? await prisma.testimonial.findUnique({ where: { id } }) 
    : null;
  let imageUrl = existing?.imageUrl 
    ?? null;
  const file = fd.get("image");

  if (file instanceof File 
    && file.size > 0) {
    if (!TYPES.has(file.type) 
      || file.size > MAX) throw new Error("Use a JPG, PNG, WEBP or AVIF image up to 8 MB.");
    const uploaded = await uploadImage(file, 
      "testimonials");
    const old = imageUrl;
    imageUrl = uploaded.secure_url;
    if (old) await deleteImage(old).catch(() => undefined);
  } else if (String(fd.get("removeImage") 
    || "") === "1" 
    && imageUrl) {
    const old = imageUrl; 
    imageUrl = null;
    await deleteImage(old).catch(() => undefined);
  }

  const data = {
    name: String(fd.get("name") 
      || "").trim(),
    role: String(fd.get("role") 
      || "").trim(),
    quote: String(fd.get("quote") 
      || "").trim(),
    imageUrl,
    rating: Math.min(5, 
      Math.max(1, 
      Number(fd.get("rating") 
        || 5))),
    order: Number(fd.get("order") 
      || 0),
    status: String(fd.get("status") 
      || "PUBLISHED") as "DRAFT" | "PUBLISHED" | "ARCHIVED",
  };

  const saved = id
    ? await prisma.testimonial.update({ where: { id }, 
      data })
    : await prisma.testimonial.create({ data });

  await writeAudit(id 
    ? "UPDATE" 
    : "CREATE", 
    "TESTIMONIAL", 
    saved.id, 
    saved.name);
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(fd: FormData) {
  await requireRole(["SUPER_ADMIN", 
    "ADMIN"]);
  const item = await prisma.testimonial.findUnique({ where: { id: String(fd.get("id") 
    || "") } });
  if (!item) return;
  await prisma.testimonial.delete({ where: { id: item.id } });
  if (item.imageUrl) await deleteImage(item.imageUrl).catch(() => undefined);
  await writeAudit("DELETE", 
    "TESTIMONIAL", 
    item.id, 
    item.name);
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}
