import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { serviceDetails } from "@/lib/service-details";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const paths = [
    "",
    "/about",
    "/services",
    "/projects",
    "/case-studies",
    "/blog",
    "/contact",
    "/book-consultation",
    "/pricing",
    "/pricing/web-software",
    "/pricing/branding",
    "/pricing/it-solutions",
    "/faq",
    "/privacy",
    "/terms",
    ...serviceDetails.map((service) => `/services/${service.slug}`),
  ];
  const [posts, studies] = await Promise.all([
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.caseStudy.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  return [
    ...paths.map((path) => ({ url: `${base}${path}` })),
    ...posts.map((post) => ({
      url: `${base}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updatedAt,
    })),
    ...studies.map((study) => ({
      url: `${base}/case-studies/${encodeURIComponent(study.slug)}`,
      lastModified: study.updatedAt,
    })),
  ];
}
