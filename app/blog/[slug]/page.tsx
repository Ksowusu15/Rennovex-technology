import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug }, 
    include: { category: true } });
  if (!post 
    || post.status !== "PUBLISHED") notFound();
  return <article className="section-space">
    <div className="container-shell max-w-4xl">
    <p className="eyebrow">
    {post.category?.name 
    ?? "Insights"}
  </p>
    <h1 className="display-title mt-5">
      {post.title}
    </h1>
    <p className="mt-5 text-sm text-slate-500">
      {formatDate(post.publishedAt 
      ?? post.createdAt)}
    </p>
    {post.image && <div className="relative mt-10 aspect-[16/8] overflow-hidden rounded-3xl">
      <Image 
    src={post.image} 
    alt={post.title} 
    fill 
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
    className="object-cover"/>
    </div>}
    <div className="prose-copy mt-10 text-lg">
      {post.content.split("\n").map((p, 
    i) => <p key={i}>
      {p}
    </p>)}
    </div>
  </div>
  </article>;
}
