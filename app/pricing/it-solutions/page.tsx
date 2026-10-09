import { PricingCategory } from "@/components/pricing-category";
import { itPricing } from "@/lib/pricing-data";

export const metadata = {
  alternates: { canonical: "/pricing/it-solutions" },
  title: "IT Solutions & Consulting | Rennovex Technology",
  description:
    "Flexible technology consulting and IT support packages for businesses that need practical guidance and implementation help.",
};

export default function Page() {
  return (
    <PricingCategory
      eyebrow="Rennovex Pricing"
      title="IT Solutions & Consulting"
      description="Flexible technology consulting and IT support packages for businesses that need practical guidance and implementation help."
      services={itPricing}
      currentHref="/pricing/it-solutions"
    />
  );
}
