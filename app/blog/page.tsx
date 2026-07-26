import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { SectionHeading } from "@/components/section-heading";
import { safePublicQuery } from "@/lib/db-resilience";

export const metadata = { title: "Blog" };

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", ...(q ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }] } : {}) },
    include: { category: true }, orderBy: { publishedAt: "desc" }
  });
  return <section className="section-space"><div className="container-shell"><SectionHeading eyebrow="Insights" title="Ideas for building better digital products and businesses."/>
    <form className="mt-10 max-w-xl"><input className="field" name="q" placeholder="Search articles..." defaultValue={q}/></form>
    <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{posts.map(post => <Link key={post.id} href={`/blog/${post.slug}`} className="glass card-hover overflow-hidden rounded-2xl">{post.image && <div className="relative aspect-[16/10]"><Image src={post.image} alt={post.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover"/></div>}<div className="p-6"><p className="text-xs font-semibold uppercase tracking-widest text-sky-700">{post.category?.name ?? "Insights"}</p><h2 className="mt-3 text-xl font-bold">{post.title}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p><p className="mt-5 text-xs text-slate-500">{formatDate(post.publishedAt ?? post.createdAt)}</p></div></Link>)}</div>
  </div></section>;
}
