import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rennovex Technology | Digital Solutions That Drive Growth",
    template: "%s | Rennovex Technology",
  },
  description:
    "Rennovex Technology builds websites, custom software, user experiences, brand visuals, and practical IT solutions for growing businesses.",
  keywords: [
    "web development Ghana",
    "custom software Ghana",
    "UI UX design",
    "technology consulting",
    "Rennovex Technology",
  ],
  applicationName: "Rennovex Technology",
  authors: [{ name: "Rennovex Technology", url: siteUrl }],
  creator: "Rennovex Technology",
  publisher: "Rennovex Technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GH",
    url: siteUrl,
    siteName: "Rennovex Technology",
    title: "Rennovex Technology | Digital Solutions That Drive Growth",
    description: "Websites, custom software, UI/UX, branding, and IT solutions for growing businesses.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Rennovex Technology" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rennovex Technology",
    description: "Digital solutions that drive business growth.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  category: "technology",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Rennovex Technology",
  url: siteUrl,
  logo: `${siteUrl}/icon`,
  email: "hello@rennovex.com",
  address: { "@type": "PostalAddress", addressLocality: "Accra", addressCountry: "GH" },
  sameAs: [],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
