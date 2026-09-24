import { ClientPortalForm } from "@/components/client-portal-form";
export const metadata={title:"Client Request Status"};
export default function ClientPortalPage(){return <section className="section-space bg-slate-50">
  <div className="container-shell grid items-start gap-10 xl:grid-cols-[.8fr_1.2fr] xl:gap-16">
  <div>
  <p className="eyebrow">Client portal</p>
  <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Track your request securely.</h1>
  <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">Enter the reference number and email used for your quote
    or consultation request. Only matching details reveal the current status.</p>
</div>
  <ClientPortalForm/>
</div>
</section>}
