import Link from "next/link";
export default function NotFound() {
  return <section className="container-shell grid min-h-[65vh] place-items-center py-20 text-center"><div><p className="eyebrow">404</p><h1 className="mt-4 text-5xl font-bold">Page not found</h1><p className="mt-4 text-slate-400">The page may have moved or does not exist.</p><Link href="/" className="btn-primary mt-7">Return home</Link></div></section>;
}
