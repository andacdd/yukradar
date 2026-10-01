"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import type { MapLoad } from "@/lib/loads";
import { LoadCard } from "@/components/load-card";

const LoadsMapInner = dynamic(() => import("./loads-map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" />,
});

export function LoadsMap({ loads }: { loads: MapLoad[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? loads.find((l) => l.id === selectedId) ?? null : null;

  return (
    <div className="space-y-3">
      <div className="relative isolate z-0 h-[60vh] min-h-80 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <LoadsMapInner loads={loads} onSelect={setSelectedId} />
      </div>
      {selected ? (
        <div className="space-y-2">
          <LoadCard load={selected} />
          <div className="flex gap-2">
            <Link href={`/ilanlar/${selected.id}`} className="btn-primary flex-1">
              İlan detayına git
            </Link>
            <button type="button" className="btn-secondary" onClick={() => setSelectedId(null)}>
              Kapat
            </button>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-slate-600">
          {loads.length > 0
            ? "Özetini görmek için haritadaki bir işarete dokunun. Numaralı daireler birden çok ilanı gösterir."
            : "Haritada gösterilecek ilan yok."}
        </p>
      )}
    </div>
  );
}
