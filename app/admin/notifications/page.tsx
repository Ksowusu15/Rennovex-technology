import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { retryNotification } from "./actions";

export default async function NotificationDeliveryPage() {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const jobs = await prisma.notificationJob.findMany({
    where: { status: { not: "SENT" } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-950">Email delivery</h1>
      <p className="text-sm text-slate-600">
        Pending and failed team alerts. Client requests remain saved while
        delivery is retried. Showing the latest 50 undelivered alerts.
      </p>
      {jobs.length === 0 && (
        <p className="surface p-5">No undelivered alerts.</p>
      )}
      {jobs.map((job) => {
        const payload = job.payload as { subject?: string };
        return (
          <section
            key={job.id}
            className="surface flex flex-wrap items-center justify-between gap-4 p-5"
          >
            <div className="min-w-0 break-words">
              <h2 className="font-semibold">
                {payload.subject || "Team alert"}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {job.status} · {job.attempts} attempts
              </p>
              {job.lastError && (
                <p className="mt-1 text-sm text-red-700">{job.lastError}</p>
              )}
            </div>
            <form action={retryNotification}>
              <input name="id" type="hidden" value={job.id} />
              <button
                className="btn-secondary"
                disabled={Boolean(
                  job.lockedUntil && job.lockedUntil > new Date(),
                )}
              >
                Retry delivery
              </button>
            </form>
          </section>
        );
      })}
    </div>
  );
}
