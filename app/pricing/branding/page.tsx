import { PricingCategory } from "@/components/pricing-category";
import { brandingPricing } from "@/lib/pricing-data";

export const metadata = {
  alternates: { canonical: "/pricing/branding" },
  title: "Graphic Design & Branding Packages | Rennovex Technology",
  description:
    "Professional visual identity and creative packages designed to keep your brand consistent across every touchpoint.",
};

export default function Page() {
  return (
    <PricingCategory
      eyebrow="Rennovex Pricing"
      title="Graphic Design & Branding Packages"
      description="Professional visual identity and creative packages designed to keep your brand consistent across every touchpoint."
      services={brandingPricing}
      currentHref="/pricing/branding"
    />
  );
}
