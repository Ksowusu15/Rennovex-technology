import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  return prisma.siteSetting.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main", companyName: "Rennovex Technology" },
  });
}

export async function updateSiteSettings(input: Parameters<typeof prisma.siteSetting.update>[0]["data"]) {
  await getSiteSettings();
  return prisma.siteSetting.update({ where: { id: "main" }, data: input });
}
