import { deleteImage, 
  uploadImage } from "@/lib/cloudinary";

export function list(value: FormDataEntryValue | null) {
  return String(value 
    ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function bool(value: FormDataEntryValue | null) {
  return value === "on" 
    || value === "true";
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

export async function saveUpload(file: File | null, 
  folder = "media") {
  if (!file 
    || file.size === 0) return null;
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Upload a JPG, PNG, WebP, AVIF, GIF, or SVG image.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  const result = await uploadImage(file, 
    folder);
  return result.secure_url;
}

export async function removeUpload(url?: string | null) {
  try {
    await deleteImage(url);
  } catch (error) {
    console.error("Unable to remove Cloudinary image:", 
      error);
  }
}
