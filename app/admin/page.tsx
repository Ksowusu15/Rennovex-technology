import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
  Layers3,
  Mail,
  MessageSquareText,
  Plus,
  ReceiptText,
} from "lucide-react";

import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { AdminTrendChart } from "@/components/admin-trend-chart";
import {
  getContentOverview,
  getEnquiryTrend,
  getLeadOverview,
  getRecentActivity,
  getRecentMessages,
} from "@/lib/dashboard-data";

function sixMonthBuckets() {
  const now = new Date();

  return Array.from({ length: 6 }, (_, 
    index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - index),
      1,
    );

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: new Intl.DateTimeFormat("en", {
        month: "short",
      }).format(date),
      messages: 0,
      quotes: 0,
      bookings: 0,
    };
  });
}

export default async function AdminDashboard() {
  const session = await requireRole([
    "SUPER_ADMIN",
    "ADMIN",
    "EDITOR",
  ]);

  const canReadLeads = session.role !== "EDITOR";

  const since = new Date();
  since.setMonth(since.getMonth() - 5, 
    1);
  since.setHours(0, 
    0, 
    0, 
    0);

  const content = await getContentOverview();

  const leads = canReadLeads
    ? await getLeadOverview()
    : null;

  const widgets = canReadLeads
    ? await Promise.all([
        getRecentMessages(),
        getRecentActivity(),
        getEnquiryTrend(since),
      ])
    : null;

  const recentMessages = widgets?.[0] 
    ?? [];
  const recentActivity = widgets?.[1] 
    ?? [];

  const trendData = widgets?.[2] ?? {
    messages: [],
    quotes: [],
    bookings: [],
  };

  const trend = sixMonthBuckets();

  const add = (
    dates: Array<{ createdAt: Date }>,
    field: "messages" | "quotes" | "bookings",
  ) => {
    for (const item of dates) {
      const date = new Date(item.createdAt);

      const bucket = trend.find(
        (item) =>
          item.key ===
          `${date.getFullYear()}-${date.getMonth()}`,
      );

      if (bucket) {
        bucket[field] += 1;
      }
    }
  };

  add(trendData.messages, 
    "messages");
  add(trendData.quotes, 
    "quotes");
  add(trendData.bookings, 
    "bookings");

  const primaryStats = [
    {
      icon: Mail,
      label: "Unread messages",
      value: leads?.unread 
        ?? 0,
      href: "/admin/messages",
      show: canReadLeads,
    },
    {
      icon: ReceiptText,
      label: "New quote requests",
      value: leads?.quoteRequests 
        ?? 0,
      href: "/admin/quotes",
      show: canReadLeads,
    },
    {
      icon: CalendarDays,
      label: "Pending bookings",
      value: leads?.bookings 
        ?? 0,
      href: "/admin/bookings",
      show: canReadLeads,
    },
    {
      icon: FolderKanban,
      label: "Published projects",
      value: content.publishedProjects,
      href: "/admin/projects",
      show: true,
    },
  ].filter((item) => item.show);

  const contentItems = [
    {
      icon: FolderKanban,
      label: "Projects",
      total: content.projects,
      published: content.publishedProjects,
      href: "/admin/projects",
    },
    {
      icon: BriefcaseBusiness,
      label: "Case studies",
      total: content.studies,
      published: content.publishedStudies,
      href: "/admin/case-studies",
    },
    {
      icon: BookOpenText,
      label: "Blog posts",
      total: content.posts,
      published: content.publishedPosts,
      href: "/admin/blog",
    },
    {
      icon: Layers3,
      label: "Services",
      total: content.services,
      published: content.publishedServices,
      href: "/admin/services",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Dashboard Header */}
      <section className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            Overview
          </p>

          <h1 className="mt-1 break-words text-2xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-3xl lg:text-4xl">
            Good day, 
            {session.name.split(" ")[0]}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            A clear view of website activity, incoming
            opportunities, and published content.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
          <Link
            href="/admin/projects#project-form"
            className={`
  inline-flex min-w-0 items-center justify-center gap-2 rounded-lg
  bg-slate-950 px-3 py-2.5 text-center text-xs font-semibold text-white
  transition hover:bg-slate-800 sm:px-4 sm:text-sm
`}
          >
            <Plus 
              size={16} 
              className="shrink-0" />
            <span className="truncate">New project</span>
          </Link>

          {canReadLeads && (
            <Link
              href="/admin/messages"
              className={`
  inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border
  border-slate-300 bg-white px-3 py-2.5 text-center text-xs font-semibold
  text-slate-700 transition hover:bg-slate-50 sm:px-4 sm:text-sm
`}
            >
              <MessageSquareText
                size={16}
                className="shrink-0"
              />
              <span className="truncate">Inbox</span>
            </Link>
          )}
        </div>
      </section>

      {/* Primary Statistics */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {primaryStats.map(
          ({
            icon: Icon,
            label,
            value,
            href,
          }) => (
            <Link
              key={label}
              href={href}
              className={`
  group min-w-0 rounded-xl border border-slate-200 bg-white p-3
  shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300
  hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-5
`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700 sm:h-10 sm:w-10">
                  <Icon size={18} />
                </span>

                <ArrowRight
                  size={16}
                  className="shrink-0 text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-blue-700"
                />
              </div>

              <p className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-slate-950 sm:mt-6 sm:text-3xl">
                {value}
              </p>

              <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500 sm:min-h-0 sm:text-sm">
                {label}
              </p>
            </Link>
          ),
        )}
      </section>

      {/* Trend Chart */}
      {canReadLeads && (
        <div className="min-w-0 overflow-hidden">
          <AdminTrendChart data={trend} />
        </div>
      )}

      {/* Messages and Content Status */}
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Recent Messages */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:items-center sm:px-6">
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-950">
                Recent messages
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Latest enquiries from the website.
              </p>
            </div>

            <Link
              href="/admin/messages"
              className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentMessages.map((message) => (
              <Link
                key={message.id}
                href="/admin/messages"
                className="grid min-w-0 gap-2 px-4 py-4 transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {message.name}
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {message.projectType ||
                      message.message}
                  </p>
                </div>

                <p className="text-xs text-slate-400 sm:text-right">
                  {formatDate(message.createdAt)}
                </p>
              </Link>
            ))}

            {recentMessages.length === 0 && (
              <p className="px-4 py-12 text-center text-sm text-slate-500 sm:px-6">
                No messages yet.
              </p>
            )}
          </div>
        </div>

        {/* Content Status */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
            <h2 className="font-semibold text-slate-950">
              Content status
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              Published items across the website.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {contentItems.map(
              ({
                icon: Icon,
                label,
                total,
                published,
                href,
              }) => {
                const percentage = total
                  ? Math.round(
                      (published / total) * 100,
                    )
                  : 0;

                return (
                  <Link
                    key={label}
                    href={href}
                    className="flex min-w-0 items-center gap-3 px-4 py-4 transition hover:bg-slate-50 sm:gap-4 sm:px-6"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                      <Icon size={17} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {published} 
                        published of 
                        {total}
                      </p>
                    </div>

                    <div className="w-14 shrink-0 sm:w-20">
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-700"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-1 text-right text-[10px] font-medium text-slate-400 sm:hidden">
                        {percentage}
                        %
                      </p>
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      {canReadLeads && (
        <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:items-center sm:px-6">
            <div className="min-w-0">
              <h2 className="font-semibold text-slate-950">
                Recent activity
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Latest changes made in the admin
                workspace.
              </p>
            </div>

            {session.role === "SUPER_ADMIN" && (
              <Link
                href="/admin/activity"
                className="shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800"
              >
                Open log
              </Link>
            )}
          </div>

          <div className="divide-y divide-slate-100">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="grid min-w-0 gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
              >
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold capitalize text-slate-800">
                    {activity.action
                      .replaceAll("_", " ")
                      .toLowerCase()}
                  </p>

                  <p className="mt-1 break-words text-xs text-slate-500">
                    {activity.user?.name 
                      ?? "System"} 
                    ·
                    {" "}
                    {activity.entity}
                  </p>
                </div>

                <p className="text-xs text-slate-400 sm:text-right">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            ))}

            {recentActivity.length === 0 && (
              <p className="px-4 py-10 text-center text-sm text-slate-500 sm:px-6">
                No activity recorded yet.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}