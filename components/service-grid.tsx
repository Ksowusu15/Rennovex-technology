import Link from "next/link";
import { ArrowUpRight, 
  Code2, 
  Globe, 
  Palette, 
  PanelsTopLeft, 
  ServerCog } from "lucide-react";
import { MotionItem, 
  MotionStagger } from "@/components/motion-reveal";

const icons: Record<string, any> = { Globe, 
  Code2, 
  Palette, 
  PanelsTopLeft, 
  ServerCog };

export function ServiceGrid({ services }: { services: any[] }) {
  return (
    <MotionStagger className="mt-12 divide-y divide-slate-200 border-y border-slate-200">
      {services.slice(0, 
        5).map((service, 
        index) => {
        const Icon = icons[service.icon] 
          ?? Code2;
        return <MotionItem key={service.id}>
          <Link 
            href={`/services/${service.slug}`} 
            className="group grid gap-5 py-7 transition md:grid-cols-[64px_1fr_1.2fr_40px] md:items-center md:py-8">
            <span className="text-sm font-semibold text-slate-400">0
              {index + 1}
            </span>
            <div className="flex items-center gap-4">
              <span className={`
  grid h-11 w-11 place-items-center rounded-lg bg-slate-100 text-slate-700
  transition group-hover:bg-blue-700 group-hover:text-white
`}>
              <Icon size={20}/>
            </span>
              <h3 className="text-xl font-semibold tracking-[-.02em] text-slate-950">
                {service.title}
              </h3>
            </div>
            <p className="max-w-2xl leading-7 text-slate-600">
              {service.summary}
            </p>
            <ArrowUpRight 
              className="text-slate-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-700" 
              size={20}/>
          </Link>
        </MotionItem>;
      })}
    </MotionStagger>
  );
}
