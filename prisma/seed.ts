import { PrismaClient, ContentStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@rennovex.com";
  const password = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: Role.SUPER_ADMIN },
    create: {
      name: process.env.ADMIN_NAME ?? "Rennovex Administrator",
      email,
      password: hashed,
      role: Role.SUPER_ADMIN
    }
  });

  const services = [
    {
      title: "Website Development",
      slug: "website-development",
      summary: "High-performance websites that convert visitors into customers.",
      description: "We design and develop responsive, secure, SEO-ready websites tailored to your business goals.",
      benefits: ["Mobile-first experience", "SEO foundations", "Fast load times", "Scalable architecture"],
      technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      icon: "Globe",
      order: 1
    },
    {
      title: "Custom Software Development",
      slug: "custom-software-development",
      summary: "Purpose-built software that streamlines operations and supports growth.",
      description: "From internal tools to customer platforms, we engineer reliable applications around your workflows.",
      benefits: ["Workflow automation", "Secure architecture", "API integrations", "Long-term maintainability"],
      technologies: ["Node.js", "Python", "PostgreSQL", "REST APIs"],
      icon: "Code2",
      order: 2
    },
    {
      title: "UI/UX Design",
      slug: "ui-ux-design",
      summary: "Intuitive product experiences grounded in research and clarity.",
      description: "We transform complex ideas into usable interfaces with thoughtful journeys and consistent design systems.",
      benefits: ["User research", "Wireframes", "Interactive prototypes", "Design systems"],
      technologies: ["Figma", "Prototyping", "Design Systems", "Usability Testing"],
      icon: "PanelsTopLeft",
      order: 3
    },
    {
      title: "Graphic Design",
      slug: "graphic-design",
      summary: "Distinct visual communication that makes your brand memorable.",
      description: "We create cohesive brand assets for digital campaigns, company materials, and product communication.",
      benefits: ["Brand consistency", "Campaign assets", "Social media design", "Print-ready files"],
      technologies: ["Adobe Creative Suite", "Figma", "Canva Pro"],
      icon: "Palette",
      order: 4
    },
    {
      title: "IT Consulting",
      slug: "it-consulting",
      summary: "Practical technology guidance aligned with your business priorities.",
      description: "We assess systems, identify risks, and build a realistic roadmap for secure digital transformation.",
      benefits: ["Technology audits", "Cloud planning", "Security guidance", "Digital roadmaps"],
      technologies: ["Cloud", "Cybersecurity", "Microsoft 365", "Infrastructure"],
      icon: "ServerCog",
      order: 5
    }
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: { ...service, status: ContentStatus.PUBLISHED }
    });
  }

  await prisma.project.upsert({
    where: { slug: "crop-disease-detection-system" },
    update: {},
    create: {
      title: "Crop Disease Detection System",
      slug: "crop-disease-detection-system",
      description: "An AI-powered platform that helps farmers identify crop diseases from uploaded or captured images.",
      technologies: ["Python", "Flask", "TensorFlow", "JavaScript"],
      image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80",
      featured: true,
      status: ContentStatus.PUBLISHED
    }
  });

  await prisma.caseStudy.upsert({
    where: { slug: "crop-disease-detection-system" },
    update: {},
    create: {
      title: "Crop Disease Detection System",
      slug: "crop-disease-detection-system",
      overview: "A practical AI solution designed to make crop disease identification more accessible.",
      challenge: "Farmers needed a faster and more accessible way to identify likely crop diseases before damage spread.",
      solution: "Rennovex developed an image-based web application that classifies crop symptoms using a trained machine-learning model.",
      process: "Discovery, dataset preparation, model training, interface design, API integration, testing, and deployment preparation.",
      technologies: ["Python", "Flask", "TensorFlow", "JavaScript"],
      results: "Improved access to preliminary crop disease identification and created a foundation for future agricultural advisory features.",
      images: ["https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1200&q=80"],
      featured: true,
      status: ContentStatus.PUBLISHED
    }
  });

  const category = await prisma.category.upsert({
    where: { slug: "development-insights" },
    update: {},
    create: { name: "Development Insights", slug: "development-insights" }
  });

  await prisma.blogPost.upsert({
    where: { slug: "building-digital-products-that-scale" },
    update: {},
    create: {
      title: "Building Digital Products That Scale",
      slug: "building-digital-products-that-scale",
      excerpt: "Five architecture decisions that make modern digital products easier to grow and maintain.",
      content: `Successful digital products are designed for change. Start with a clear domain model, keep interfaces simple, automate quality checks, measure performance, and document important decisions. Scalable architecture is not about using the most tools—it is about choosing the right boundaries and building a dependable foundation.`,
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      categoryId: category.id
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
