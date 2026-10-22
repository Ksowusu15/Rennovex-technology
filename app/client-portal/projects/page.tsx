import Link from "next/link";
import type { Prisma } from "@prisma/client";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  FileText,
  FolderKanban,
  LifeBuoy,
} from "lucide-react";
import { requirePortalClient } from "@/lib/client-workspace";
import { prisma } from "@/lib/prisma";
import { pageNumber, workspaceDate } from "@/lib/workspace";
import { safeFileUrl } from "@/lib/safe-url";
import {
  StatusBadge,
  WorkspaceEmpty,
  WorkspaceHeading,
  WorkspacePanel,
} from "@/components/workspace/ui";

export const metadata = { title: "My projects | Rennovex Client Portal" };
export default async function ClientProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const client = await requirePortalClient();
  const params = await searchParams;
  const filter =
    params.status === "completed"
      ? "completed"
      : params.status === "ongoing"
        ? "ongoing"
        : "all";
  const where: Prisma.ClientProjectWhereInput = {
    clientId: client.id,
    ...(filter === "completed"
      ? { status: "COMPLETED" }
      : filter === "ongoing"
        ? { status: { not: "COMPLETED" } }
        : {}),
  };
  const count = await prisma.clientProject.count({ where });
  const pages = Math.max(1, Math.ceil(count / 8));
  const page = Math.min(pageNumber(params.page), pages);
  const projects = await prisma.clientProject.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    take: 8,
    skip: (page - 1) * 8,
    include: {
      milestones: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
      files: { orderBy: { createdAt: "desc" } },
    },
  });
  return (
    <main className="portal-shell">
      <WorkspaceHeading
        eyebrow="From planning to delivery"
        title="My projects"
        description="Follow progress, review milestones and access everything the team has shared."
        actions={
          <Link href="/client-portal/support" className="btn-secondary">
            <LifeBuoy size={16} />
            Ask about a project
          </Link>
        }
      />
      <nav className="workspace-tabs !mt-0" aria-label="Filter projects">
        {["all", "ongoing", "completed"].map((status) => (
          <Link
            href={`/client-portal/projects?status=${status}`}
            key={status}
            aria-current={filter === status ? "page" : undefined}
          >
            {status === "all"
              ? "All projects"
              : status === "ongoing"
                ? "Ongoing"
                : "Completed"}
          </Link>
        ))}
      </nav>
      <div className="grid gap-6">
        {projects.length ? (
          projects.map((project) => (
            <WorkspacePanel
              title={project.name}
              description={
                project.description || "Project progress and deliverables"
              }
              action={<StatusBadge status={project.status} />}
              key={project.id}
            >
              <div className="workspace-form-section">
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays size={15} />
                    {project.dueDate
                      ? `Target completion: ${workspaceDate(project.dueDate)}`
                      : "Completion date to be agreed"}
                  </span>
                  <span>Updated {workspaceDate(project.updatedAt)}</span>
                </div>
                <div className="mt-6">
                  <div className="portal-project-progress-label">
                    <span>Overall progress</span>
                    <strong>{project.progress}% complete</strong>
                  </div>
                  <div
                    className="workspace-progress"
                    role="progressbar"
                    aria-label={`${project.name} progress`}
                    aria-valuenow={project.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${project.progress}%` }} />
                  </div>
                </div>
                <div className="mt-7">
                  <h3 className="text-sm font-semibold">
                    Project milestones{" "}
                    <span className="ml-2 font-normal text-slate-500">
                      {
                        project.milestones.filter((item) => item.completed)
                          .length
                      }
                      /{project.milestones.length}
                    </span>
                  </h3>
                  {project.milestones.length ? (
                    <div className="portal-milestones">
                      {project.milestones.map((milestone) => (
                        <div className="portal-milestone" key={milestone.id}>
                          {milestone.completed ? (
                            <CheckCircle2
                              size={17}
                              className="text-emerald-600"
                              aria-label="Complete"
                            />
                          ) : (
                            <Circle
                              size={17}
                              className="text-slate-400"
                              aria-label="Not complete"
                            />
                          )}
                          <span>{milestone.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">
                      The team will share milestones as the project takes shape.
                    </p>
                  )}
                </div>
                <div className="mt-7 border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-semibold">
                    Shared files & deliverables
                  </h3>
                  {project.files.length ? (
                    <div className="portal-file-grid">
                      {project.files.map((file) => {
                        const href = safeFileUrl(file.url);
                        return href ? (
                          <a
                            key={file.id}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="portal-file"
                            aria-label={`${file.name}, opens in a new tab`}
                          >
                            <FileText size={19} />
                            <span>{file.name}</span>
                            <ArrowUpRight size={15} />
                          </a>
                        ) : (
                          <p key={file.id} className="portal-file">
                            {file.name} · Contact support for an updated link.
                          </p>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">
                      Deliverables will appear here when they are ready to
                      share.
                    </p>
                  )}
                </div>
              </div>
            </WorkspacePanel>
          ))
        ) : (
          <WorkspaceEmpty
            icon={FolderKanban}
            title={
              filter === "all"
                ? "No projects assigned yet"
                : "No projects in this view"
            }
            description="Your project workspace will appear here once the team assigns your work."
            action={
              <Link href="/client-portal/support" className="btn-secondary">
                Contact the team
                <ArrowRight size={15} />
              </Link>
            }
          />
        )}
      </div>
      {pages > 1 && (
        <div className="workspace-pagination mt-6 rounded-xl border border-slate-200 bg-white">
          <span>
            {count} projects · Page {page} of {pages}
          </span>
          <nav aria-label="Project pages">
            {page > 1 && (
              <Link
                className="btn-secondary"
                href={`/client-portal/projects?status=${filter}&page=${page - 1}`}
              >
                Previous
              </Link>
            )}
            {page < pages && (
              <Link
                className="btn-secondary"
                href={`/client-portal/projects?status=${filter}&page=${page + 1}`}
              >
                Next
              </Link>
            )}
          </nav>
        </div>
      )}
    </main>
  );
}
