export type ServiceDetail = {
  title: string;
  slug: string;
  eyebrow: string;
  summary: string;
  description: string;
  audience: readonly string[];
  deliverables: readonly string[];
  process: readonly {
    title: string;
    text: string;
  }[];
  benefits: readonly string[];
  technologies: readonly string[];
  pricingSlug?: string;
};

export const serviceDetails: readonly ServiceDetail[] = [
  {
    title: "Website Development",
    slug: "website-development",
    eyebrow: "Web Development",
    summary:
      "Professional websites built to strengthen your brand, communicate clearly and turn visitors into enquiries.",
    description:
      "Rennovex designs and develops responsive business websites that balance strong visual presentation with speed, usability, security and a foundation for search visibility.",
    audience: [
      "Startups and growing businesses",
      "Corporate and professional service firms",
      "Organisations modernising an existing website",
      "Brands that need a credible digital presence",
    ],
    deliverables: [
      "Responsive website design and development",
      "Content structure and conversion-focused page layouts",
      "Contact forms and business integrations",
      "SEO foundations and analytics setup",
      "Performance and mobile optimisation",
      "Deployment and post-launch support",
    ],
    process: [
      {
        title: "Discovery",
        text: "We clarify your goals, audience, content, competitors and the actions your website should drive.",
      },
      {
        title: "Structure & Design",
        text: "We organise the experience and create a professional interface aligned with your brand.",
      },
      {
        title: "Development",
        text: "We build the responsive website, integrations and content experience with maintainability in mind.",
      },
      {
        title: "Testing & Launch",
        text: "We test key devices, forms and performance before deployment and handover.",
      },
    ],
    benefits: [
      "Mobile-first customer experience",
      "Professional brand presentation",
      "Fast, maintainable architecture",
      "Clear conversion paths",
      "SEO-ready technical foundation",
      "Room to expand as the business grows",
    ],
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "PostgreSQL",
      "Cloudinary",
    ],
    pricingSlug: "website-development",
  },
  {
    title: "E-commerce Development",
    slug: "e-commerce-development",
    eyebrow: "E-commerce",
    summary:
      "Modern online stores with product management, secure payments and a smooth customer buying experience.",
    description:
      "We build e-commerce platforms for businesses that need more than a basic product catalogue, combining storefront design, checkout, inventory tools and customer features in one scalable experience.",
    audience: [
      "Fashion and lifestyle brands",
      "Retailers moving sales online",
      "Businesses managing growing product catalogues",
      "Brands that need customer accounts and order management",
    ],
    deliverables: [
      "Responsive online storefront",
      "Product, category and inventory management",
      "Shopping cart and checkout",
      "Payment gateway integration",
      "Customer accounts and order management",
      "Discounts, search, filters and analytics where required",
    ],
    process: [
      {
        title: "Commerce Discovery",
        text: "We define your catalogue, fulfilment process, payment flow and operational requirements.",
      },
      {
        title: "Store Experience",
        text: "We design product discovery, product pages, cart and checkout around a clear customer journey.",
      },
      {
        title: "Commerce Build",
        text: "We implement catalogue management, payments, accounts and the administration experience.",
      },
      {
        title: "Testing & Handover",
        text: "We test purchasing flows, responsive behaviour and management tools before launch.",
      },
    ],
    benefits: [
      "Professional mobile shopping experience",
      "Simplified catalogue administration",
      "Secure payment integration",
      "Better product discovery",
      "Customer and order visibility",
      "Scalable foundation for future growth",
    ],
    technologies: [
      "Next.js",
      "React",
      "PostgreSQL",
      "Prisma",
      "Paystack",
      "Cloudinary",
    ],
    pricingSlug: "e-commerce-development",
  },
  {
    title: "Custom Software Development",
    slug: "custom-software-development",
    eyebrow: "Custom Software",
    summary:
      "Purpose-built systems, portals, dashboards and automation designed around the way your organisation works.",
    description:
      "When off-the-shelf software does not fit, Rennovex develops tailored applications that organise workflows, connect data and give teams the tools they need to operate efficiently.",
    audience: [
      "Businesses replacing manual processes",
      "Teams that need internal dashboards or portals",
      "Organisations requiring role-based systems",
      "Companies connecting multiple operational workflows",
    ],
    deliverables: [
      "Requirements and workflow analysis",
      "Secure role-based applications",
      "Dashboards and reporting",
      "Database and API architecture",
      "Business workflow automation",
      "Deployment, documentation and support",
    ],
    process: [
      {
        title: "Requirements",
        text: "We map users, workflows, permissions, data and the business problem the system must solve.",
      },
      {
        title: "Solution Design",
        text: "We define the architecture, modules and interface before implementation.",
      },
      {
        title: "Iterative Development",
        text: "Core functionality is developed and reviewed in practical stages.",
      },
      {
        title: "Deployment & Support",
        text: "We validate the system, deploy it and support adoption and future improvements.",
      },
    ],
    benefits: [
      "Software aligned with your actual workflow",
      "Reduced repetitive manual work",
      "Centralised operational information",
      "Secure role-based access",
      "Better reporting and visibility",
      "Architecture that can evolve with the business",
    ],
    technologies: [
      "Next.js",
      "Node.js",
      "Python",
      "PostgreSQL",
      "REST APIs",
      "Cloud Platforms",
    ],
    pricingSlug: "custom-software-development",
  },
  {
    title: "UI/UX Design",
    slug: "ui-ux-design",
    eyebrow: "Product Design",
    summary:
      "Clear, intuitive digital experiences shaped around user needs and business objectives.",
    description:
      "We turn ideas and complex workflows into structured interfaces through research, user journeys, wireframes, polished screens and reusable design systems.",
    audience: [
      "Startups validating a digital product",
      "Businesses redesigning an existing platform",
      "Software teams that need design before development",
      "Organisations simplifying complex user journeys",
    ],
    deliverables: [
      "User flows and information architecture",
      "Wireframes",
      "Responsive interface design",
      "Interactive prototypes",
      "Reusable components and design systems",
      "Developer-ready design handoff",
    ],
    process: [
      {
        title: "Understand",
        text: "We clarify users, business goals, constraints and the primary journeys.",
      },
      {
        title: "Structure",
        text: "We map flows and wireframes before investing in visual detail.",
      },
      {
        title: "Design",
        text: "We create polished responsive interfaces and reusable patterns.",
      },
      {
        title: "Validate & Handoff",
        text: "We refine the experience and prepare clear assets for development.",
      },
    ],
    benefits: [
      "Clearer user journeys",
      "Consistent interface patterns",
      "Reduced design ambiguity during development",
      "Responsive experiences",
      "Professional product presentation",
      "Better usability and customer confidence",
    ],
    technologies: [
      "Figma",
      "Wireframing",
      "Interactive Prototyping",
      "Design Systems",
      "Responsive Design",
      "Usability Review",
    ],
  },
  {
    title: "Graphic Design & Branding",
    slug: "graphic-design",
    eyebrow: "Brand & Visual Design",
    summary:
      "Consistent visual identities and marketing assets that help businesses communicate professionally.",
    description:
      "Rennovex develops practical brand and campaign assets for businesses that want a stronger, more consistent visual presence across digital and print touchpoints.",
    audience: [
      "New businesses establishing a visual identity",
      "Brands refreshing inconsistent marketing materials",
      "Teams running digital campaigns",
      "Organisations that need professional branded assets",
    ],
    deliverables: [
      "Logo and visual identity support",
      "Social media and campaign graphics",
      "Business stationery",
      "Marketing and presentation materials",
      "Print-ready assets",
      "Brand consistency guidance",
    ],
    process: [
      {
        title: "Creative Brief",
        text: "We establish the audience, brand personality, use cases and required deliverables.",
      },
      {
        title: "Direction",
        text: "We develop a focused visual direction and initial concepts.",
      },
      {
        title: "Refinement",
        text: "Selected concepts are refined through structured revision rounds.",
      },
      {
        title: "Delivery",
        text: "Final assets are prepared for the required digital and print formats.",
      },
    ],
    benefits: [
      "More consistent brand presentation",
      "Professional customer-facing materials",
      "Reusable campaign assets",
      "Clearer visual communication",
      "Digital and print-ready outputs",
      "A stronger foundation for future marketing",
    ],
    technologies: [
      "Adobe Creative Suite",
      "Figma",
      "Canva Pro",
      "Brand Systems",
      "Digital Assets",
      "Print Production",
    ],
    pricingSlug: "graphic-design-branding",
  },
  {
    title: "IT Solutions & Consulting",
    slug: "it-consulting",
    eyebrow: "IT Consulting",
    summary:
      "Practical technology guidance and implementation support aligned with your organisation's priorities.",
    description:
      "We help businesses assess their technology environment, identify practical improvements and make better decisions about systems, infrastructure, security and digital operations.",
    audience: [
      "Growing organisations reviewing their IT setup",
      "Businesses planning a technology upgrade",
      "Teams that need independent implementation guidance",
      "Organisations improving reliability and security",
    ],
    deliverables: [
      "IT needs and infrastructure assessment",
      "Technology recommendations",
      "Security and operational review",
      "Implementation roadmap",
      "Vendor and solution guidance",
      "Advisory and ongoing support options",
    ],
    process: [
      {
        title: "Assess",
        text: "We review the current environment, business needs, constraints and priority risks.",
      },
      {
        title: "Recommend",
        text: "We propose realistic improvements based on impact, cost and urgency.",
      },
      {
        title: "Plan",
        text: "Recommendations are organised into a practical implementation roadmap.",
      },
      {
        title: "Support",
        text: "Where required, Rennovex assists with implementation, coordination and follow-up.",
      },
    ],
    benefits: [
      "Better technology decisions",
      "Clearer infrastructure priorities",
      "Reduced operational risk",
      "Practical security guidance",
      "A realistic digital roadmap",
      "Access to ongoing technical support",
    ],
    technologies: [
      "Cloud Services",
      "Microsoft 365",
      "Networking",
      "Cybersecurity",
      "Infrastructure",
      "Business Systems",
    ],
    pricingSlug: "it-solutions-consulting",
  },
];

export function getServiceDetail(slug: string) {
  return serviceDetails.find((service) => service.slug === slug);
}
