import type { ReactNode } from "react";
import { ChartNoAxesCombined, Inbox, type LucideIcon } from "lucide-react";
import type { AnalyticsRow } from "@/lib/google-analytics";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="analytics-empty-state">
      <div className="analytics-empty-icon">
        <Icon
          size={23}
          strokeWidth={1.7}
        />
      </div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

type PanelProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
};

export function Panel({
  title,
  description,
  icon: Icon,
  children,
}: PanelProps) {
  return (
    <section className="analytics-card">
      <header className="analytics-card-head">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <span className="analytics-card-icon">
          <Icon
            size={19}
            strokeWidth={1.8}
          />
        </span>
      </header>
      <div className="analytics-card-body">{children}</div>
    </section>
  );
}

type BreakdownProps = {
  rows: AnalyticsRow[];
  emptyTitle: string;
  emptyDescription: string;
};

export function Breakdown({
  rows,
  emptyTitle,
  emptyDescription,
}: BreakdownProps) {
  if (!rows.some((row) => row.value > 0)) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const max = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="analytics-breakdown">
      {rows.slice(0, 8).map((item, index) => (
        <div
          className="analytics-breakdown-item"
          key={`${item.name}-${index}`}
        >
          <div className="analytics-breakdown-label">
            <span title={item.name}>{item.name || "Other"}</span>
            <strong>{item.value.toLocaleString()}</strong>
          </div>
          <div className="analytics-bar">
            <span style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const CHART_WIDTH = 700;
const CHART_HEIGHT = 180;
const CHART_PADDING = 10;

function formatDate(value: string) {
  return /^\d{8}$/.test(value)
    ? `${value.slice(4, 6)}/${value.slice(6, 8)}`
    : value;
}

export function Trend({ rows }: { rows: AnalyticsRow[] }) {
  if (!rows.some((row) => row.value > 0)) {
    return (
      <EmptyState
        icon={ChartNoAxesCombined}
        title="No visitor activity yet"
        description="Your visitor trend will appear here once Google Analytics starts reporting visits for this period."
      />
    );
  }

  const max = Math.max(...rows.map((row) => row.value), 1);
  const points = rows.map((row, index) => ({
    x:
      CHART_PADDING +
      (rows.length === 1
        ? (CHART_WIDTH - CHART_PADDING * 2) / 2
        : (index * (CHART_WIDTH - CHART_PADDING * 2)) / (rows.length - 1)),
    y:
      CHART_HEIGHT -
      CHART_PADDING -
      (row.value / max) * (CHART_HEIGHT - CHART_PADDING * 2),
  }));
  const line = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"}${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
    )
    .join(" ");
  const area = `${line} L${points[points.length - 1].x} ${CHART_HEIGHT} L${points[0].x} ${CHART_HEIGHT} Z`;
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="analytics-trend-wrap">
      <div className="analytics-chart-summary">
        <strong>{total.toLocaleString()}</strong>
        <span>Visitors during this period</span>
      </div>
      <div
        className="analytics-line-chart"
        role="img"
        aria-label={`Visitor trend for ${rows.length} days`}
      >
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="analytics-fill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#3776d2"
                stopOpacity=".20"
              />
              <stop
                offset="100%"
                stopColor="#3776d2"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((fraction) => (
            <line
              key={fraction}
              x1="0"
              y1={CHART_HEIGHT * fraction}
              x2={CHART_WIDTH}
              y2={CHART_HEIGHT * fraction}
              stroke="#e8edf5"
              strokeDasharray="4 6"
            />
          ))}
          <path
            d={area}
            fill="url(#analytics-fill)"
          />
          <path
            d={line}
            fill="none"
            stroke="#2563b8"
            strokeWidth="3"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="analytics-chart-labels">
        <span>{formatDate(rows[0].name)}</span>
        <span>{formatDate(rows[Math.floor((rows.length - 1) / 2)].name)}</span>
        <span>{formatDate(rows[rows.length - 1].name)}</span>
      </div>
    </div>
  );
}
