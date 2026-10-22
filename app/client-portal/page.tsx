import Link from "next/link";
import { ArrowLeft, FileCheck2, FolderKanban, LifeBuoy } from "lucide-react";
import { redirect } from "next/navigation";
import { ClientLoginForm } from "@/components/client-login-form";
import { SiteLogo } from "@/components/site-logo";
import { getClientSession } from "@/lib/client-auth";

export const metadata = { title: "Client workspace | Rennovex Technology" };
export default async function ClientPortalPage() {
  const session = await getClientSession();
  if (session) redirect("/client-portal/dashboard");
  return (
    <main className="portal-login">
      <div className="portal-login-story">
        <Link href="/">
          <ArrowLeft size={16} />
          Return to website
        </Link>
        <div className="portal-login-message">
          <SiteLogo dark />
          <p className="workspace-eyebrow">Your Rennovex workspace</p>
          <h1>
            Great work starts
            <br className="hidden sm:block" /> with staying connected.
          </h1>
          <p>
            A dedicated space for your projects, shared files and conversations
            with the Rennovex team.
          </p>
          <div className="portal-login-features">
            <div>
              <FolderKanban size={20} />
              <span>Follow every stage of your project</span>
            </div>
            <div>
              <FileCheck2 size={20} />
              <span>Find deliverables and invoice details</span>
            </div>
            <div>
              <LifeBuoy size={20} />
              <span>Get support when you need a hand</span>
            </div>
          </div>
        </div>
        <footer>Rennovex Technology · Technology with purpose</footer>
      </div>
      <div className="portal-login-form-area">
        <div>
          <ClientLoginForm />
        </div>
      </div>
    </main>
  );
}
