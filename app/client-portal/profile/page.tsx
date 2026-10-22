import { ShieldCheck, UserRound } from "lucide-react";
import { ClientProfileForm } from "@/components/client-profile-form";
import { requirePortalClient } from "@/lib/client-workspace";
import { initials, workspaceDate } from "@/lib/workspace";
import { WorkspaceHeading, WorkspacePanel } from "@/components/workspace/ui";

export const metadata = { title: "My account | Rennovex Client Portal" };
export default async function ClientProfilePage() {
  const client = await requirePortalClient();
  return (
    <main className="portal-shell">
      <WorkspaceHeading
        eyebrow="Made for you"
        title="My account"
        description="Keep your contact details up to date and manage access to your workspace."
      />
      <div className="portal-form-layout">
        <div className="portal-stack">
          <div className="workspace-panel portal-account-card">
            <span className="workspace-avatar">{initials(client.name)}</span>
            <div>
              <h2>{client.name}</h2>
              <p>{client.email}</p>
              <p>Client since {workspaceDate(client.createdAt)}</p>
            </div>
          </div>
          <WorkspacePanel
            title="Contact details & security"
            description="Your email address is managed by the Rennovex team"
          >
            <div className="workspace-form-section">
              <ClientProfileForm
                company={client.company || ""}
                phone={client.phone || ""}
              />
            </div>
          </WorkspacePanel>
        </div>
        <div className="portal-stack">
          <WorkspacePanel title="Account information">
            <dl className="grid gap-5 p-6 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Account holder</dt>
                <dd className="mt-1 font-medium">{client.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Sign-in email</dt>
                <dd className="mt-1 font-medium">{client.email}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Access</dt>
                <dd className="mt-1 inline-flex items-center gap-2 font-medium text-emerald-700">
                  <ShieldCheck size={15} />
                  Active client account
                </dd>
              </div>
            </dl>
          </WorkspacePanel>
          <div className="workspace-callout">
            <UserRound size={20} className="mb-3" />
            <strong>Need to change your name or email?</strong>
            <p className="mt-2 text-xs leading-6">
              Contact the team through Support. They’ll help you update the
              account associated with your projects.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
