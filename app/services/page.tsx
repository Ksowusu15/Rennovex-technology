import { prisma } from "@/lib/prisma";
import { SectionHeading } from "@/components/section-heading";
import { ServiceGrid } from "@/components/service-grid";
import { safePublicQuery } from "@/lib/db-resilience";

export const metadata = { title: "Services" };

export default async function ServicesPage() {
  const services = await safePublicQuery(() => prisma.service.findMany({ where: { status: "PUBLISHED" }, 
    orderBy: { order: "asc" } }), 
    [], 
    "services-list");
  return <section className="section-space">
    <div className="container-shell">
    <SectionHeading 
    eyebrow="Services" 
    title="Digital expertise designed around your next stage of growth." 
    text="Engage Rennovex for a focused project or an ongoing technology partnership."/>
    <ServiceGrid services={services}/>
  </div>
  </section>;
}
