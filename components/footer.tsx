"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  LockKeyhole,
  Mail,
  MapPin,
  Music2,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SiteLogo } from "@/components/site-logo";

type PublicSiteSettings = {
  companyName?: string | null;
  contactEmail?: string | null;
  phone?: string | null;
  address?: string | null;
  copyrightText?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  xUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
};

const FALLBACK_SETTINGS: PublicSiteSettings = {
  companyName: "Rennovex Technology",
  contactEmail: "rennovextechnology@gmail.com",
  phone: "+233 55 425 0225",
  address: "Accra, Ghana",
};

function normaliseExternalUrl(value?: string | null) {
  const url = value?.trim();

  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `https://${url}`;
}

export function Footer() {
  const [settings, setSettings] =
    useState<PublicSiteSettings>(FALLBACK_SETTINGS);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSettings() {
      try {
        const response = await fetch("/api/site-settings", {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as PublicSiteSettings;

        setSettings((current) => ({
          ...current,
          ...data,
        }));
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          return;
        }

        // Keep safe fallback values when settings cannot be loaded.
      }
    }

    void loadSettings();

    return () => {
      controller.abort();
    };
  }, []);

  const socialLinks = useMemo(
    () =>
      [
        {
          label: "LinkedIn",
          href: normaliseExternalUrl(settings.linkedinUrl),
          icon: Linkedin,
        },
        {
          label: "Instagram",
          href: normaliseExternalUrl(settings.instagramUrl),
          icon: Instagram,
        },
        {
          label: "Facebook",
          href: normaliseExternalUrl(settings.facebookUrl),
          icon: Facebook,
        },
        {
          label: "X / Twitter",
          href: normaliseExternalUrl(settings.xUrl),
          icon: Twitter,
        },
        {
          label: "TikTok",
          href: normaliseExternalUrl(settings.tiktokUrl),
          icon: Music2,
        },
        {
          label: "YouTube",
          href: normaliseExternalUrl(settings.youtubeUrl),
          icon: Youtube,
        },
      ].filter(
        (
          social,
        ): social is {
          label: string;
          href: string;
          icon: typeof Linkedin;
        } => Boolean(social.href),
      ),
    [settings],
  );

  const companyName =
    settings.companyName?.trim() || "Rennovex Technology";
  const contactEmail =
    settings.contactEmail?.trim() ||
    "rennovextechnology@gmail.com";
  const phone = settings.phone?.trim() || "+233 55 425 0225";
  const address = settings.address?.trim() || "Accra, Ghana";

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      <div className="container-shell py-12">
        <div className="grid gap-8 min-[520px]:grid-cols-2 sm:gap-10 lg:grid-cols-[1.25fr_.7fr_.8fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex"
              aria-label={`${companyName} home`}
            >
              <SiteLogo />
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-500">
              Innovative solutions for a smarter, brighter tomorrow.
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-3">
                {socialLinks.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${companyName} on ${label}`}
                    title={label}
                    className="grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-blue-50 text-[#071d49] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-600 hover:text-white"
                  >
                    <Icon size={17} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-[#071d49]">
              Quick Links
            </h3>

            <div className="mt-4 grid gap-2 text-sm text-slate-500">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/services">Services</Link>
              <Link href="/projects">Projects</Link>
              <Link href="/blog">Insights</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#071d49]">
              Our Services
            </h3>

            <div className="mt-4 grid gap-2 text-sm text-slate-500">
              <Link href="/services">Software Development</Link>
              <Link href="/services">Graphic Design</Link>
              <Link href="/services">IT Consulting</Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#071d49]">Contact</h3>

            <div className="mt-4 grid gap-3 text-sm text-slate-500">
              <span className="flex items-start gap-2">
                <MapPin
                  className="mt-0.5 shrink-0"
                  size={15}
                />
                {address}
              </span>

              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 transition hover:text-blue-700"
              >
                <Phone size={15} />
                {phone}
              </a>

              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-2 break-all transition hover:text-blue-700"
              >
                <Mail className="shrink-0" size={15} />
                {contactEmail}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:mt-10 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {settings.copyrightText?.trim() ||
              `© ${new Date().getFullYear()} ${companyName}. All rights reserved.`}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>

            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-blue-700"
            >
              <LockKeyhole size={13} />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
