import { COMPANY_EMAIL } from "@/lib/company-contact";
import type { SiteSetting } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const defaultSettings: SiteSetting = {
  id: "main",
  companyName: "Rennovex Technology",
  logoUrl: null,
  faviconUrl: null,
  contactEmail: COMPANY_EMAIL,
  phone: null,
  whatsapp: null,
  address: null,
  businessHours: null,
  googleMapsEmbedUrl: null,
  facebookUrl: null,
  linkedinUrl: null,
  instagramUrl: null,
  xUrl: null,
  tiktokUrl: null,
  youtubeUrl: null,
  defaultSeoTitle: null,
  defaultSeoDescription: null,
  copyrightText: null,
  updatedAt: new Date(0),
};

/** Public reads and builds must not create settings rows. */
export async function getSiteSettings() {
  return (
    (await prisma.siteSetting.findUnique({ where: { id: "main" } })) ??
    defaultSettings
  );
}

export async function updateSiteSettings(
  input: Parameters<typeof prisma.siteSetting.update>[0]["data"],
) {
  await prisma.siteSetting.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", companyName: "Rennovex Technology" },
  });
  return prisma.siteSetting.update({ where: { id: "main" }, data: input });
}
