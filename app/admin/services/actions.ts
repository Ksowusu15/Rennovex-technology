"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { list } from "@/lib/admin";
import { writeAudit } from "@/lib/audit";
import { requireRole } from "@/lib/auth";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export async function saveService(fd: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN", "EDITOR"]);

  const id = String(fd.get("id") || "").trim();
  const title = String(fd.get("title") || "").trim();
  const imageFile = fd.get("image");
  const removeImage = String(fd.get("removeImage") || "") === "1";

  const existing = id
    ? await prisma.service.findUnique({
        where: { id },
        select: { imageUrl: true },
      })
    : null;

  let imageUrl = existing?.imageUrl ?? null;

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
      redirect(
        `/admin/services?${id ? `edit=${id}&` : "new=1&"}error=${encodeURIComponent(
          "Please upload a JPG, PNG, WEBP or AVIF image.",
        )}`,
      );
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
      redirect(
        `/admin/services?${id ? `edit=${id}&` : "new=1&"}error=${encodeURIComponent(
          "Service image must be 8 MB or smaller.",
        )}`,
      );
    }

    const uploaded = await uploadImage(imageFile, "services");
    const previousImage = imageUrl;
    imageUrl = uploaded.secure_url;

    if (previousImage) {
      await deleteImage(previousImage).catch(() => undefined);
    }
  } else if (removeImage && imageUrl) {
    const previousImage = imageUrl;
    imageUrl = null;
    await deleteImage(previousImage).catch(() => undefined);
  }

  const data = {
    title,
    slug: slugify(String(fd.get("slug") || title)),
    summary: String(fd.get("summary") || "").trim(),
    description: String(fd.get("description") || "").trim(),
    benefits: list(fd.get("benefits")),
    technologies: list(fd.get("technologies")),
    icon: String(fd.get("icon") || "Code2"),
    imageUrl,
    order: Number(fd.get("order") || 0),
    status: String(fd.get("status") || "PUBLISHED") as
      | "DRAFT"
      | "PUBLISHED"
      | "ARCHIVED",
  };

  const saved = id
    ? await prisma.service.update({ where: { id }, data })
    : await prisma.service.create({ data });

  await writeAudit(
    id ? "UPDATE" : "CREATE",
    "SERVICE",
    saved.id,
    title,
  );

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath(`/services/${saved.slug}`);
  revalidatePath("/admin/services");

  redirect("/admin/services");
}

export async function deleteService(fd: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const id = String(fd.get("id") || "");
  const service = await prisma.service.findUnique({
    where: { id },
  });

  if (!service) {
    return;
  }

  await prisma.service.delete({ where: { id } });

  if (service.imageUrl) {
    await deleteImage(service.imageUrl).catch(() => undefined);
  }

  await writeAudit("DELETE", "SERVICE", service.id, service.title);

  revalidatePath("/");
  revalidatePath("/services");
  revalidatePath("/admin/services");
}
