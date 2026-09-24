import Image from "next/image";
import { Building2, 
  CheckCircle2, 
  ImagePlus, 
  MapPinned, 
  Search, 
  Share2 } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";
import { requireRole } from "@/lib/auth";
import { removeLogo, 
  saveSettings } from "./actions";

type Props = { searchParams: Promise<{ saved?: string; removed?: string }> };
const Field = ({ label, name, value, type="text", placeholder="" }:
  {label:string;name:string;value?:string|null;type?:string;placeholder?:string}) => <label className="label">
  {label}
  <input 
  className="field" 
  name={name} 
  type={type} 
  defaultValue={value
    ??""} 
  placeholder={placeholder}/>
</label>;

export default async function SettingsPage({ searchParams }: Props) {
  await requireRole(["SUPER_ADMIN", 
    "ADMIN"]);
  const [settings, params] = await Promise.all([getSiteSettings(), 
    searchParams]);
  return <div className="space-y-7">
    <div>
      <p className="eyebrow">Website settings</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Brand, contact and SEO</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Manage the business information used throughout the website.</p>
    </div>
    {(params.saved
      ||params.removed)&&<div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
      <CheckCircle2 size={19}/>
      <div>
        <p className="font-semibold">Settings updated</p>
      <p>
        {params.removed
        ?"The logo was removed."
        :"Your website settings were saved successfully."}
      </p>
      </div>
    </div>}
    <form 
      action={saveSettings} 
      className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="admin-card">
          <div className="flex items-center gap-2">
          <Building2 
          className="text-blue-700" 
          size={19}/>
          <h2 className="font-bold text-slate-950">Business identity</h2>
        </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field 
          label="Company name" 
          name="companyName" 
          value={settings.companyName}/>
          <Field 
          label="Notification email" 
          name="contactEmail" 
          type="email" 
          value={settings.contactEmail}/>
          <Field 
          label="Phone" 
          name="phone" 
          value={settings.phone}/>
          <Field 
          label="WhatsApp" 
          name="whatsapp" 
          value={settings.whatsapp}/>
          <Field 
          label="Business hours" 
          name="businessHours" 
          value={settings.businessHours}/>
          <label className="label sm:col-span-2">Address
          <textarea 
          className="field min-h-24" 
          name="address" 
          defaultValue={settings.address
            ??""}/>
          </label>
          </div>
        </section>
        <section className="admin-card">
          <div className="flex items-center gap-2">
          <MapPinned 
          className="text-blue-700" 
          size={19}/>
          <h2 className="font-bold text-slate-950">Google Maps</h2>
        </div>
          <div className="mt-5">
            <label className="label">Google Maps embed URL or iframe code
          <textarea 
          className="field min-h-32 font-mono text-xs leading-6" 
          name="googleMapsEmbed" 
          defaultValue={settings.googleMapsEmbedUrl
            ??""} 
          placeholder={'https://www.google.com/maps/embed?pb=...\n\nor paste the complete <iframe ...></iframe> code'}/>
          <span className="text-xs font-normal text-slate-500">In Google Maps, choose Share → Embed a map → Copy HTML. You may
            paste either the full iframe code or only its src URL.</span>
          </label>
          </div>
        </section>
        <section className="admin-card">
          <div className="flex items-center gap-2">
          <Share2 
          className="text-blue-700" 
          size={19}/>
          <h2 className="font-bold text-slate-950">Social profiles</h2>
        </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field 
          label="Facebook" 
          name="facebookUrl" 
          type="url" 
          value={settings.facebookUrl}/>
          <Field 
          label="LinkedIn" 
          name="linkedinUrl" 
          type="url" 
          value={settings.linkedinUrl}/>
          <Field 
          label="Instagram" 
          name="instagramUrl" 
          type="url" 
          value={settings.instagramUrl}/>
          <Field 
          label="X / Twitter" 
          name="xUrl" 
          type="url" 
          value={settings.xUrl}/>
          <Field 
          label="TikTok" 
          name="tiktokUrl" 
          type="url" 
          value={settings.tiktokUrl}/>
          <Field 
          label="YouTube" 
          name="youtubeUrl" 
          type="url" 
          value={settings.youtubeUrl}/>
          </div>
        </section>
        <section className="admin-card">
          <div className="flex items-center gap-2">
          <Search 
          className="text-blue-700" 
          size={19}/>
          <h2 className="font-bold text-slate-950">SEO defaults</h2>
        </div>
          <div className="mt-5 space-y-4">
            <Field 
          label="Default page title" 
          name="defaultSeoTitle" 
          value={settings.defaultSeoTitle}/>
          <label className="label">Default meta description
          <textarea 
          className="field min-h-28" 
          name="defaultSeoDescription" 
          defaultValue={settings.defaultSeoDescription
            ??""}/>
          </label>
          <Field 
          label="Copyright text" 
          name="copyrightText" 
          value={settings.copyrightText}/>
          </div>
        </section>
      </div>
      <aside className="space-y-4">
        <div className="admin-card sticky top-24">
        <h2 className="font-bold text-slate-950">Company logo</h2>
        <div className="mt-4 grid min-h-48 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          {settings.logoUrl?<div className="relative h-28 w-full">
          <Image 
        src={settings.logoUrl} 
        alt="Company logo" 
        fill 
        sizes="300px" 
        className="object-contain"/>
        </div>:<div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-700 text-2xl font-bold text-white">R</div>}
        </div>
        <label className="label mt-4">
          <span className="flex items-center gap-2">
          <ImagePlus size={17}/> 
        Replace logo</span>
        <input 
        className="field file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700" 
        name="logo" 
        type="file" 
        accept="image/png,image/jpeg,image/webp,image/svg+xml"/>
        <span className="text-xs font-normal text-slate-500">PNG, JPG, WebP or SVG. Maximum 5 MB.</span>
        </label>
        <button className="btn-primary mt-5 w-full justify-center">Save all settings</button>
      </div>
        {settings.logoUrl&&<button 
        formAction={removeLogo} 
        className="btn-danger w-full">Remove logo</button>}
      </aside>
    </form>
  </div>;
}
