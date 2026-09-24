"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { removeUpload, 
  saveUpload } from "@/lib/admin";
import { getSiteSettings, 
  updateSiteSettings } from "@/lib/site-settings";
import { requireRole } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

const text = (formData: FormData, 
  name: string) => String(formData.get(name) 
    || "").trim() 
    || null;

function googleMapsEmbed(formData: FormData) {
  const raw = String(formData.get("googleMapsEmbed") 
    || "").trim();
  if (!raw) return null;

  const iframeSrc = raw.match(/src=["']([^"']+)["']/i)?.[1];
  const value = (iframeSrc 
    || raw).replace(/&amp;/g, 
    "&").trim();

  try {
    const url = new URL(value);
    const allowed = url.hostname === "www.google.com" 
      || url.hostname === "google.com" 
      || url.hostname === "maps.google.com";
    const isEmbed = url.pathname.includes("/maps/embed") 
      || url.pathname.includes("/maps/d/embed");
    return allowed 
      && isEmbed 
      ? url.toString() 
      : null;
  } catch {
    return null;
  }
}

export async function saveSettings(formData: FormData) {
  await requireRole(["SUPER_ADMIN", 
    "ADMIN"]);
  const existing = await getSiteSettings();
  const uploadedLogo = await saveUpload(formData.get("logo") as File | null, 
    "branding");
  if (uploadedLogo 
    && existing.logoUrl) await removeUpload(existing.logoUrl);

  await updateSiteSettings({
    companyName: String(formData.get("companyName") 
      || "Rennovex Technology").trim(),
    contactEmail: text(formData, 
      "contactEmail"),
    phone: text(formData, 
      "phone"),
    whatsapp: text(formData, 
      "whatsapp"),
    address: text(formData, 
      "address"),
    businessHours: text(formData, 
      "businessHours"),
    googleMapsEmbedUrl: googleMapsEmbed(formData),
    facebookUrl: text(formData, 
      "facebookUrl"),
    linkedinUrl: text(formData, 
      "linkedinUrl"),
    instagramUrl: text(formData, 
      "instagramUrl"),
    xUrl: text(formData, 
      "xUrl"),
    tiktokUrl: text(formData, 
      "tiktokUrl"),
    youtubeUrl: text(formData, 
      "youtubeUrl"),
    defaultSeoTitle: text(formData, 
      "defaultSeoTitle"),
    defaultSeoDescription: text(formData, 
      "defaultSeoDescription"),
    copyrightText: text(formData, 
      "copyrightText"),
    ...(uploadedLogo 
      ? { logoUrl: uploadedLogo } 
      : {}),
  });
  await writeAudit("UPDATE", 
    "SETTINGS", 
    "main", 
    "Company, contact, map, social and SEO settings updated");
  revalidatePath("/", 
    "layout");
  redirect("/admin/settings?saved=1");
}

export async function removeLogo() {
  await requireRole(["SUPER_ADMIN", 
    "ADMIN"]);
  const existing = await getSiteSettings();
  if (existing.logoUrl) await removeUpload(existing.logoUrl);
  await updateSiteSettings({ logoUrl: null });
  await writeAudit("DELETE", 
    "LOGO", 
    "main", 
    "Company logo removed");
  revalidatePath("/", 
    "layout");
  redirect("/admin/settings?removed=1");
}
