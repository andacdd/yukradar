import Link from "next/link";
import { vehicleLabel } from "@/lib/data/options";
import { formatKm } from "@/lib/geo";
import { formatDate, formatPrice, formatRelative, formatWeight, routeLabel, type LoadCardData } from "@/lib/loads";
import { SourceBadge } from "./source-badge";

type Props = {
  load: LoadCardData;
  distanceKm?: number | null;
  distanceUnknown?: boolean;
};

export function LoadCard({ load, distanceKm, distanceUnknown }: Props) {
  const route = routeLabel(load);
  return (
    <Link href={`/ilanlar/${load.id}`} className="card block transition hover:border-brand-600">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-900">
            {route.from} <span className="text-slate-400">→</span> {route.to}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">{load.cargo_type}</p>
        </div>
        <p className="shrink-0 text-right text-sm font-semibold text-brand-700">{formatPrice(load.price, load.currency)}</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {typeof distanceKm === "number" && (
          <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
            {formatKm(distanceKm)} uzakta
          </span>
        )}
        {distanceUnknown && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">Mesafe bilinmiyor</span>
        )}
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{formatWeight(load.weight_tons)}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">{vehicleLabel(load.vehicle_type)}</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">Yükleme: {formatDate(load.load_date)}</span>
        {load.source === "whatsapp" && <SourceBadge />}
      </div>
      <p className="mt-2 text-xs text-slate-400">{formatRelative(load.created_at)}</p>
    </Link>
  );
}
