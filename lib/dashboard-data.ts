import { prisma } from "@/lib/prisma";
import { withDatabaseRetry } from "@/lib/db-resilience";

export type ContentOverview = {
  projects: number;
  studies: number;
  posts: number;
  services: number;
  publishedProjects: number;
  publishedStudies: number;
  publishedPosts: number;
  publishedServices: number;
};

export type LeadOverview = {
  messages: number;
  unread: number;
  assistantConversations: number;
  quoteRequests: number;
  bookings: number;
};

async function safeDashboardQuery<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await withDatabaseRetry(operation, 
      { retries: 1, 
      delayMs: 450 });
  } catch (error) {
    console.error(`[dashboard:${label}]`, 
      error);
    return fallback;
  }
}

const EMPTY_CONTENT: ContentOverview = {
  projects: 0,
  studies: 0,
  posts: 0,
  services: 0,
  publishedProjects: 0,
  publishedStudies: 0,
  publishedPosts: 0,
  publishedServices: 0,
};

const EMPTY_LEADS: LeadOverview = {
  messages: 0,
  unread: 0,
  assistantConversations: 0,
  quoteRequests: 0,
  bookings: 0,
};

export async function getContentOverview(): Promise<ContentOverview> {
  return safeDashboardQuery("content-overview", async () => {
    // Keep each batch at or below the Neon pool limit.
    const firstBatch = await Promise.all([
      prisma.project.count(),
      prisma.caseStudy.count(),
      prisma.blogPost.count(),
      prisma.service.count(),
    ]);

    const secondBatch = await Promise.all([
      prisma.project.count({ where: { status: "PUBLISHED" } }),
      prisma.caseStudy.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.service.count({ where: { status: "PUBLISHED" } }),
    ]);

    return {
      projects: firstBatch[0],
      studies: firstBatch[1],
      posts: firstBatch[2],
      services: firstBatch[3],
      publishedProjects: secondBatch[0],
      publishedStudies: secondBatch[1],
      publishedPosts: secondBatch[2],
      publishedServices: secondBatch[3],
    };
  }, EMPTY_CONTENT);
}

export async function getLeadOverview(): Promise<LeadOverview> {
  return safeDashboardQuery("lead-overview", async () => {
    const [messages, unread, assistantConversations, quoteRequests, bookings] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { status: "UNREAD" } }),
      prisma.chatSession.count(),
      prisma.quoteRequest.count({ where: { status: "NEW" } }),
      prisma.consultationBooking.count({ where: { status: "PENDING" } }),
    ]);

    return { messages, 
      unread, 
      assistantConversations, 
      quoteRequests, 
      bookings };
  }, EMPTY_LEADS);
}

export async function getRecentMessages() {
  return safeDashboardQuery(
    "recent-messages",
    () => prisma.message.findMany({ orderBy: { createdAt: "desc" }, 
      take: 5 }),
    [],
  );
}

export async function getRecentActivity() {
  return safeDashboardQuery(
    "recent-activity",
    () => prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } } },
    }),
    [],
  );
}

export async function getEnquiryTrend(since: Date) {
  return safeDashboardQuery("enquiry-trend", async () => {
    const [messages, quotes, bookings] = await Promise.all([
      prisma.message.findMany({ where: { createdAt: { gte: since } }, 
        select: { createdAt: true } }),
      prisma.quoteRequest.findMany({ where: { createdAt: { gte: since } }, 
        select: { createdAt: true } }),
      prisma.consultationBooking.findMany({ where: { createdAt: { gte: since } }, 
        select: { createdAt: true } }),
    ]);
    return { messages, 
      quotes, 
      bookings };
  }, { messages: [], 
    quotes: [], 
    bookings: [] });
}
