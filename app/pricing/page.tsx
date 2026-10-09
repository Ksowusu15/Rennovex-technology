import { PricingCategory } from "@/components/pricing-category";
import { allPricing } from "@/lib/pricing-data";

export const metadata = {
  alternates: { canonical: "/pricing" },
  title: "Pricing | Rennovex Technology",
  description: "Explore Rennovex Technology package categories and starting prices.",
};

export default function PricingPage() {
  return (
    <PricingCategory
      eyebrow="Simple, transparent starting points"
      title="Pricing built around the service you need."
      description={
        "Explore all Rennovex packages in one place, or use the Pricing menu to open only the category you need."
      }
      services={allPricing}
      showExplore={false}
    />
  );
}
