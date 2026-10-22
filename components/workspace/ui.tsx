import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Inbox } from "lucide-react";
import { statusLabel, statusTone } from "@/lib/workspace";

export function WorkspaceHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="workspace-heading">
      <div>
        <p className="workspace-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="workspace-description">{description}</p>}
      </div>
      {actions && <div className="workspace-actions">{actions}</div>}
    </div>
  );
}

export function WorkspaceMetric({
  icon: Icon,
  label,
  value,
  detail,
  href,
  tone = "blue",
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  detail?: string;
  href?: string;
  tone?: string;
}) {
  const content = (
    <>
      <div className="workspace-metric-top">
        <span className="workspace-icon" data-tone={tone}>
          <Icon size={19} aria-hidden="true" />
        </span>
        {href && (
          <ArrowUpRight
            size={17}
            className="workspace-muted"
            aria-hidden="true"
          />
        )}
      </div>
      <p className="workspace-metric-label">{label}</p>
      <p className="workspace-metric-value">{value}</p>
      {detail && <p className="workspace-metric-detail">{detail}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="workspace-metric">
      {content}
    </Link>
  ) : (
    <div className="workspace-metric">{content}</div>
  );
}

export function WorkspacePanel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`workspace-panel ${className}`}>
      <div className="workspace-panel-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function WorkspaceEmpty({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="workspace-empty">
      <span className="workspace-icon">
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  return (
    <span className="workspace-badge" data-tone={statusTone(status)}>
      <span aria-hidden="true" />
      {label || statusLabel(status)}
    </span>
  );
}
