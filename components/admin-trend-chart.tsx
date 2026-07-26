import { BarChart3 } from "lucide-react";

type TrendPoint = {
  label: string;
  messages: number;
  quotes: number;
  bookings: number;
};

export function AdminTrendChart({ data }: { data: TrendPoint[] }) {
  const maxValue = Math.max(1, ...data.flatMap((point) => [point.messages, point.quotes, point.bookings]));

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><BarChart3 size={18} /></span>
            <div>
              <h2 className="text-lg font-bold text-slate-950 sm:text-xl">Enquiry trends</h2>
              <p className="mt-0.5 text-sm text-slate-500">Messages, quotes and consultations over six months.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Messages</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-500" /> Quotes</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Bookings</span>
        </div>
      </div>

      <div className="mt-7 grid min-h-52 grid-cols-6 items-end gap-1.5 border-b sm:min-h-60 sm:gap-3 lg:min-h-72 border-slate-200 sm:gap-4">
        {data.map((point) => (
          <div key={point.label} className="flex h-full min-w-0 flex-col justify-end">
            <div className="flex h-44 items-end lg:h-52 justify-center gap-1 sm:gap-1.5">
              {[
                [point.messages, "bg-blue-600"],
                [point.quotes, "bg-violet-500"],
                [point.bookings, "bg-amber-500"],
              ].map(([value, className], index) => {
                const numericValue = value as number;
                const height = numericValue === 0 ? 4 : Math.max(12, Math.round((numericValue / maxValue) * 100));
                return <div key={index} title={`${numericValue}`} className={`w-2.5 rounded-t-md transition-all sm:w-4 ${className}`} style={{ height: `${height}%`, opacity: numericValue === 0 ? 0.18 : 1 }} />;
              })}
            </div>
            <p className="mt-3 truncate text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400 sm:text-xs">{point.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
