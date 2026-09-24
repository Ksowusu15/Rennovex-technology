import { Clock3, 
  Mail, 
  MapPin, 
  Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <main>
      <section className="section-space">
        <div className="container-shell grid gap-12 xl:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="eyebrow">Contact</p>
            <h1 className="display-title mt-5">Let’s build something valuable together.</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">Share your goals, challenge, or early-stage idea. We will review it
              and respond with the most useful next step.</p>
            <div className="mt-9 grid gap-4 text-sm text-slate-700">
              {settings.contactEmail && <a 
                className="flex items-start gap-3 transition hover:text-blue-700" 
                href={`mailto:${settings.contactEmail}`}>
                <Mail 
                className="mt-0.5 shrink-0 text-sky-700" 
                size={19}/>
                <span className="break-all">
                  {settings.contactEmail}
                </span>
              </a>}
              {settings.phone && <a 
                className="flex items-start gap-3 transition hover:text-blue-700" 
                href={`tel:${settings.phone.replace(/\s/g, 
                "")}`}>
                <Phone 
                className="mt-0.5 shrink-0 text-sky-700" 
                size={19}/>
                <span>
                  {settings.phone}
                </span>
              </a>}
              {settings.address && <span className="flex items-start gap-3">
                <MapPin 
                className="mt-0.5 shrink-0 text-sky-700" 
                size={19}/>
                <span>
                  {settings.address}
                </span>
              </span>}
              {settings.businessHours && <span className="flex items-start gap-3">
                <Clock3 
                className="mt-0.5 shrink-0 text-sky-700" 
                size={19}/>
                <span>
                  {settings.businessHours}
                </span>
              </span>}
            </div>
          </div>
          <ContactForm/>
        </div>
      </section>

      {settings.googleMapsEmbedUrl && (
        <section className="pb-16 sm:pb-20 lg:pb-24">
          <div className="container-shell">
            <div className="mb-6 max-w-2xl">
              <p className="eyebrow">Find us</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Visit Rennovex Technology</h2>
            </div>
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
              <iframe
                src={settings.googleMapsEmbedUrl}
                title="Rennovex Technology location on Google Maps"
                className="h-[280px] w-full border-0 sm:h-[360px] lg:h-[420px] xl:h-[480px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
