"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "@/lib/geo";

export type RouteMapProps = {
  pickup: LatLng;
  delivery: LatLng;
  pickupLabel: string;
  deliveryLabel: string;
};

const RouteMapInner = dynamic(() => import("./route-map-inner"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slate-200" />,
});

export function RouteMap(props: RouteMapProps) {
  return (
    <div className="relative isolate z-0 h-64 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-72">
      <RouteMapInner {...props} />
    </div>
  );
}
