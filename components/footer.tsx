import Link from "next/link";
import { LockKeyhole, Mail, MapPin } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { NewsletterForm } from "@/components/newsletter-form";

const footerLinkClass =
  "rounded-md transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-white">
      <div className="container-shell py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-[1.25fr_.8fr_.8fr_1fr]">
          <div>
            <Link
              href="/"
              aria-label="Rennovex Technology home"
              className="inline-flex"
            >
              <SiteLogo dark />
            </Link>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              Practical digital solutions for businesses that want to improve,
              grow, and operate with confidence.
            </p>
          </div>

          <div>
            <h3 className="font-semibold">Quick links</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              <Link className={footerLinkClass} href="/">Home</Link>
              <Link className={footerLinkClass} href="/services">Services</Link>
              <Link className={footerLinkClass} href="/case-studies">Case Studies</Link>
              <Link className={footerLinkClass} href="/projects">Projects</Link>
              <Link className={footerLinkClass} href="/blog">Insights</Link>
              <Link className={footerLinkClass} href="/about">About</Link>
              <Link className={footerLinkClass} href="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Contact</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <Mail size={16} /> rennovextechnology@gmail.com
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} /> Accra, Ghana
              </span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold">Rennovex insights</h3>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Occasional digital strategy and product updates. No spam.
            </p>
            <NewsletterForm />
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-slate-500">
              © {new Date().getFullYear()} Rennovex Technology. All rights reserved.
            </p>

            <nav
              aria-label="Legal and administration links"
              className="flex flex-wrap items-center gap-x-4 gap-y-3 text-xs"
            >
              <Link className="text-slate-400 transition hover:text-white" href="/privacy">
                Privacy Policy
              </Link>
              <Link className="text-slate-400 transition hover:text-white" href="/terms">
                Terms of Service
              </Link>
              <Link
                href="/admin/login"
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 font-semibold text-slate-200 shadow-sm transition hover:border-blue-500 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <LockKeyhole size={14} aria-hidden="true" />
                Admin Portal
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
