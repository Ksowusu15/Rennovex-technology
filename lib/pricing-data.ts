export type PricingPlan = {
  name: string;
  price: string;
  popular?: boolean;
  features: readonly string[];
};

export type PricingService = {
  service: string;
  slug: string;
  description: string;
  plans: readonly PricingPlan[];
};

export const developmentPricing: readonly PricingService[] = [
  {
    service: "Website Development",
    slug: "website-development",
    description: "Professional websites for businesses, brands and organisations.",
    plans: [
      { name: "Starter", price: "2,500", features: ["Up to 5 pages", "Responsive design", "Basic SEO setup", "Contact form", "3 months support", "Social links integration"] },
      { name: "Professional", price: "4,500", popular: true, features: ["Up to 10 pages", "Advanced responsive design", "SEO optimisation", "CMS integration", "6 months support", "Analytics setup", "Business email setup"] },
      { name: "Premium", price: "7,500+", features: ["Expanded page structure", "Custom functionality", "Advanced SEO foundation", "E-commerce readiness", "12 months support", "Priority support", "Custom integrations", "Performance optimisation"] },
    ],
  },
  {
    service: "E-commerce Development",
    slug: "e-commerce-development",
    description: "Secure online stores with product management, payments and a smooth customer experience.",
    plans: [
      { name: "Starter", price: "4,500", features: ["Initial setup for up to 45 products", "Responsive online storefront", "Product categories and search", "Shopping cart and checkout", "Paystack/payment gateway integration", "Basic inventory management", "Order notifications", "WhatsApp integration", "Basic SEO setup", "1 month support"] },
      { name: "Professional", price: "7,500", popular: true, features: ["Initial setup for up to 75 products", "Everything in Starter", "Customer accounts", "Wishlist functionality", "Coupons and discount management", "Advanced inventory management", "Advanced search and filters", "Order status and tracking", "Analytics integration", "Improved SEO foundation", "3 months support"] },
      { name: "Premium", price: "12,000+", features: ["100+ initial products based on scope", "Everything in Professional", "Advanced customer dashboard", "Multiple payment options", "Custom business integrations", "Advanced reporting", "Performance optimisation", "Scalable catalogue architecture", "Priority support", "6 months support"] },
    ],
  },
  {
    service: "Custom Software Development",
    slug: "custom-software-development",
    description: "Purpose-built systems, portals, APIs and automation for your workflows.",
    plans: [
      { name: "Starter", price: "5,000+", features: ["Small business application", "Core workflow", "User authentication", "Basic dashboard", "Database setup", "3 months support"] },
      { name: "Professional", price: "10,000+", popular: true, features: ["Multi-module application", "Role-based access", "Advanced dashboard", "API integrations", "Reporting", "6 months support", "Deployment assistance"] },
      { name: "Premium", price: "18,000+", features: ["Complex business platform", "Custom integrations", "Automation workflows", "Advanced reporting", "Scalable architecture", "12 months support", "Priority maintenance"] },
    ],
  },
];

export const brandingPricing: readonly PricingService[] = [
  {
    service: "Graphic Design & Branding",
    slug: "graphic-design-branding",
    description: "Professional visual identity and marketing assets that make your business consistent and memorable.",
    plans: [
      { name: "Starter", price: "1,000", features: ["Essential brand graphics", "2 design concepts", "Social media templates", "Business card design", "2 revision rounds", "Web-ready exports"] },
      { name: "Professional", price: "2,500", popular: true, features: ["Expanded visual identity", "Logo refinement or creation", "Campaign graphics", "Print-ready assets", "Editable source files", "3 revision rounds", "Brand consistency guide"] },
      { name: "Premium", price: "4,500+", features: ["Complete visual identity support", "Brand guidelines", "Stationery suite", "Multi-channel campaign assets", "Presentation templates", "Marketing collateral", "Priority turnaround", "Extended revisions"] },
    ],
  },
];

export const itPricing: readonly PricingService[] = [
  {
    service: "IT Solutions & Consulting",
    slug: "it-solutions-consulting",
    description: "Practical technology advice, implementation support and ongoing IT solutions for growing organisations.",
    plans: [
      { name: "Consultation", price: "1,000", features: ["IT needs assessment", "Infrastructure review", "Technology recommendations", "1 strategy session", "Recommendations report", "30-day follow-up"] },
      { name: "Business IT Support", price: "2,500", popular: true, features: ["Detailed technology audit", "Security review", "Infrastructure roadmap", "Vendor guidance", "Implementation support", "Priority consultation", "90-day advisory"] },
      { name: "Managed / Custom", price: "5,000+", features: ["Custom IT solution planning", "Infrastructure planning", "Security guidance", "Procurement support", "Implementation oversight", "Priority support", "6 months advisory"] },
    ],
  },
];

export const allPricing = [...developmentPricing, ...brandingPricing, ...itPricing] as const;
