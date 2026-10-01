"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { PROVINCES_SORTED, getProvince } from "@/lib/data/provinces";
import { provinceCenter, roundCoord, type LatLng } from "@/lib/geo";
import { PAGE_SIZE, type NearbyLoad } from "@/lib/loads";
import { listHref, type nearbyRpcParams } from "@/lib/load-filters";
import { LoadCard } from "@/components/load-card";
import { Pagination } from "@/components/pagination";

type GeoError = "denied" | "unavailable" | "timeout" | "unsupported";

type GeoState = { status: "pending" } | { status: "ok"; coords: LatLng } | { status: "error"; reason: GeoError };

type Result = { key: string; rows: NearbyLoad[]; failed: boolean };

type Props = {
  rpcFilters: ReturnType<typeof nearbyRpcParams>;
  page: number;
  centerProvince: number | null;
  filterParams: Record<string, string>;
};

const GEO_MESSAGES: Record<GeoError, string> = {
  denied: "Konum izni verilmedi.",
  unavailable: "Konumunuz belirlenemedi.",
  timeout: "Konum alınırken zaman aşımı oldu.",
  unsupported: "Tarayıcınız konum özelliğini desteklemiyor.",
};

let sessionCoords: LatLng | null = null;

export function NearbyLoads({ rpcFilters, page, centerProvince, filterParams }: Props) {
  const [geo, setGeo] = useState<GeoState>(() =>
    sessionCoords ? { status: "ok", coords: sessionCoords } : { status: "pending" },
  );
  const [result, setResult] = useState<Result | null>(null);
  const configured = isSupabaseConfigured();
  const usingGps = centerProvince === null;

  useEffect(() => {
    if (!usingGps || geo.status !== "pending") return;
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      void Promise.resolve().then(() => setGeo({ status: "error", reason: "unsupported" }));
      return;
    }
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const coords = { lat: roundCoord(pos.coords.latitude), lng: roundCoord(pos.coords.longitude) };
        sessionCoords = coords;
        setGeo({ status: "ok", coords });
      },
      (err) => {
        if (cancelled) return;
        const reason: GeoError =
          err.code === err.PERMISSION_DENIED ? "denied" : err.code === err.TIMEOUT ? "timeout" : "unavailable";
        setGeo({ status: "error", reason });
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 },
    );
    return () => {
      cancelled = true;
    };
  }, [usingGps, geo.status]);

  const origin: LatLng | null = usingGps
    ? geo.status === "ok"
      ? geo.coords
      : null
    : provinceCenter(centerProvince);
  const lat = origin?.lat ?? null;
  const lng = origin?.lng ?? null;
  const requestKey = lat === null || lng === null ? null : `${lat},${lng},${page},${JSON.stringify(rpcFilters)}`;

  useEffect(() => {
    if (lat === null || lng === null || !configured) return;
    const supabase = createClient();
    if (!supabase) return;
    const key = `${lat},${lng},${page},${JSON.stringify(rpcFilters)}`;
    let cancelled = false;
    supabase
      .rpc("nearby_loads", {
        ...rpcFilters,
        p_lat: lat,
        p_lng: lng,
        p_limit: PAGE_SIZE,
        p_offset: (page - 1) * PAGE_SIZE,
      })
      .then(({ data, error }) => {
        if (cancelled) return;
        setResult({ key, rows: (data ?? []) as NearbyLoad[], failed: Boolean(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, page, rpcFilters, configured]);

  const current = result && result.key === requestKey ? result : null;
  const loading = requestKey !== null && configured && current === null;
  const rows = current?.rows ?? [];
  const total = rows[0]?.total_count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const centerName = centerProvince ? getProvince(centerProvince)?.name : null;
  const paginationParams: Record<string, string> = { ...filterParams, sirala: "yakin" };
  if (centerProvince) paginationParams.merkez = String(centerProvince);
  const hasFilters = Object.keys(filterParams).length > 0;

  return (
    <div className="mt-4 space-y-3">
      <div className="card space-y-3">
        <p className="text-sm text-slate-700">
          {usingGps ? (
            geo.status === "ok" ? (
              <>
                Alım noktası <strong>konumunuza</strong> en yakın ilanlar üstte.
              </>
            ) : geo.status === "error" ? (
              <span className="text-amber-800">
                {GEO_MESSAGES[geo.reason]} Aşağıdan bir il seçerek il merkezine göre sıralayabilirsiniz.
              </span>
            ) : (
              "Konumunuz alınıyor… Tarayıcı izin isterse onaylayın."
            )
          ) : (
            <>
              Alım noktası <strong>{centerName} merkezine</strong> en yakın ilanlar üstte.
            </>
          )}
        </p>
        <form method="get" action="/ilanlar" className="flex flex-col gap-2 sm:flex-row">
          {Object.entries(filterParams).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <input type="hidden" name="sirala" value="yakin" />
          <label htmlFor="merkez" className="sr-only">
            İl merkezine göre sırala
          </label>
          <select
            id="merkez"
            name="merkez"
            defaultValue={centerProvince ? String(centerProvince) : ""}
            className="field-input sm:flex-1"
            required
          >
            <option value="" disabled>
              İl seçin
            </option>
            {PROVINCES_SORTED.map((p) => (
              <option key={p.code} value={String(p.code)}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">
            İle göre sırala
          </button>
        </form>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>Konumunuz sunucuya kaydedilmez, yalnızca bu sıralama için kullanılır.</span>
          {usingGps && geo.status === "error" && (
            <button type="button" className="font-medium text-brand-700 underline" onClick={() => setGeo({ status: "pending" })}>
              Konumu tekrar dene
            </button>
          )}
          {!usingGps && (
            <Link href={listHref({ ...filterParams, sirala: "yakin" })} className="font-medium text-brand-700 underline">
              Konumumu kullan
            </Link>
          )}
        </div>
      </div>

      {!configured && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Supabase bağlantısı yapılandırılmamış.</p>
      )}
      {current?.failed && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">İlanlar yüklenemedi. Lütfen tekrar deneyin.</p>
      )}
      {loading && <div className="card animate-pulse text-center text-sm text-slate-500">Yakındaki ilanlar aranıyor…</div>}

      {current && !current.failed && (
        <>
          <p className="text-sm text-slate-600">{total} aktif ilan, yakından uzağa sıralı</p>
          {rows.map((load) => (
            <LoadCard key={load.id} load={load} distanceKm={load.distance_km} distanceUnknown={load.distance_km === null} />
          ))}
          {rows.length === 0 && (
            <div className="card text-center text-sm text-slate-600">
              {page > 1 ? (
                <Link href={listHref(paginationParams)} className="text-brand-700 underline">
                  Bu sayfada ilan yok, ilk sayfaya dön
                </Link>
              ) : hasFilters ? (
                "Bu filtrelere uyan ilan bulunamadı."
              ) : (
                "Henüz aktif ilan yok."
              )}
            </div>
          )}
          <Pagination page={page} totalPages={totalPages} params={paginationParams} />
        </>
      )}
    </div>
  );
}
