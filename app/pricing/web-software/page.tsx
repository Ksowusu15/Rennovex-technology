import { PricingCategory } from "@/components/pricing-category";
import { developmentPricing } from "@/lib/pricing-data";

export const metadata = {
  alternates: { canonical: "/pricing/web-software" },
  title: "Web & Software Development Packages | Rennovex Technology",
  description:
    "Websites, e-commerce stores and custom software, grouped in one focused development pricing experience.",
};

export default function Page() {
  return (
    <PricingCategory
      eyebrow="Rennovex Pricing"
      title="Web & Software Development Packages"
      description="Websites, e-commerce stores and custom software, grouped in one focused development pricing experience."
      services={developmentPricing}
      currentHref="/pricing/web-software"
    />
  );
}
