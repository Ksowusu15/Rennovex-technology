import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChartNoAxesCombined,
  ExternalLink,
  Eye,
  Globe2,
  MousePointerClick,
  Users,
} from "lucide-react";
import {
  Breakdown,
  EmptyState,
  Panel,
  Trend,
} from "@/components/admin/analytics/analytics-panels";
import { WorkspaceHeading, WorkspaceMetric } from "@/components/workspace/ui";
import { requireRole } from "@/lib/auth";
import { getAnalytics } from "@/lib/google-analytics";

export const metadata = { title: "Website Analytics | Rennovex Admin" };
export const dynamic = "force-dynamic";

const REPORTING_PERIODS = [7, 30, 90] as const;

type PageProps = {
  searchParams: Promise<{ period?: string }>;
};

export default async function AnalyticsPage({ searchParams }: PageProps) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const { period } = await searchParams;
  const requestedDays = Number(period);
  const days = REPORTING_PERIODS.some((value) => value === requestedDays)
    ? requestedDays
    : 30;

  const result = await getAnalytics(days)
    .then((data) => ({ data, error: "" }))
    .catch((error: unknown) => ({
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Analytics is temporarily unavailable.",
    }));
  const { data, error } = result;

  return (
    <div className="analytics-page">
      <WorkspaceHeading
        eyebrow="Website intelligence"
        title="Website Analytics"
        description="Monitor your website's reach, engagement and customer interactions."
        actions={
          <a
            className="analytics-external"
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Google Analytics <ExternalLink size={15} />
          </a>
        }
      />

      <div className="analytics-toolbar">
        <div className="analytics-toolbar-label">
          <CalendarDays size={17} />
          <span>Reporting period</span>
        </div>
        <nav
          className="analytics-periods"
          aria-label="Analytics reporting period"
        >
          {REPORTING_PERIODS.map((value) => (
            <Link
              key={value}
              aria-current={value === days ? "page" : undefined}
              className={value === days ? "is-active" : ""}
              href={`/admin/analytics?period=${value}`}
            >
              {value} days
            </Link>
          ))}
        </nav>
      </div>

      {error && (
        <section
          className="analytics-notice"
          role="status"
        >
          <strong>Analytics connection unavailable</strong>
          <p>
            We couldn't retrieve your website reports. Check the GA4 property
            ID, service account access and server credentials.
          </p>
          <details>
            <summary>Technical details</summary>
            <p>{error}</p>
          </details>
        </section>
      )}

      {data ? (
        <>
          <div className="analytics-metrics">
            <WorkspaceMetric
              icon={Users}
              label="Total visitors"
              value={data.users.toLocaleString()}
              detail={`Last ${days} days`}
            />
            <WorkspaceMetric
              icon={Eye}
              label="Page views"
              value={data.views.toLocaleString()}
              detail="Tracked page views"
            />
            <WorkspaceMetric
              icon={Activity}
              label="Sessions"
              value={data.sessions.toLocaleString()}
              detail="Website visits"
            />
            <WorkspaceMetric
              icon={MousePointerClick}
              label="Engagement rate"
              value={`${(data.engagement * 100).toFixed(1)}%`}
              detail="Engaged sessions"
            />
          </div>

          <div className="analytics-grid">
            <Panel
              title="Visitor trend"
              description="Daily visitors across the selected period"
              icon={ChartNoAxesCombined}
            >
              <Trend rows={data.traffic} />
            </Panel>
            <Panel
              title="Traffic sources"
              description="Where your website visitors come from"
              icon={Globe2}
            >
              <Breakdown
                rows={data.sources}
                emptyTitle="No traffic sources yet"
                emptyDescription="Acquisition channels will appear once sessions are recorded."
              />
            </Panel>
            <Panel
              title="Most visited pages"
              description="Pages attracting the most attention"
              icon={Eye}
            >
              <Breakdown
                rows={data.pages}
                emptyTitle="No page views yet"
                emptyDescription="Your most popular pages will show here as traffic is recorded."
              />
            </Panel>
            <Panel
              title="Tracked interactions"
              description="Events captured by Google Analytics 4"
              icon={MousePointerClick}
            >
              <Breakdown
                rows={data.events}
                emptyTitle="No interaction events yet"
                emptyDescription="Configured events such as contact and WhatsApp clicks will appear when recorded."
              />
            </Panel>
          </div>

          <div className="analytics-footnote">
            <BarChart3 size={17} />
            <p>
              Reports are fetched securely from Google Analytics 4 and may be
              delayed. For live visitor counts, use{" "}
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Analytics <ArrowUpRight size={13} />
              </a>
              .
            </p>
          </div>
        </>
      ) : !error ? (
        <EmptyState
          title="No analytics data available"
          description="Please try again later."
        />
      ) : null}
    </div>
  );
}
