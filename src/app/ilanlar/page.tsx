import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  LOAD_MAP_COLUMNS,
  LOAD_PUBLIC_COLUMNS,
  MAP_LOAD_LIMIT,
  PAGE_SIZE,
  type LoadCardData,
  type LoadPublic,
  type MapLoad,
} from "@/lib/loads";
import { VEHICLE_TYPES } from "@/lib/data/options";
import { PROVINCES_SORTED } from "@/lib/data/provinces";
import {
  activeFilterParams,
  applyLoadFilters,
  listHref,
  nearbyRpcParams,
  normalizeFilters,
  pickParam,
  readFilters,
  validProvince,
  type ListSort,
  type ListView,
} from "@/lib/load-filters";
import { pointOrProvince } from "@/lib/geo";
import { LoadCard } from "@/components/load-card";
import { Pagination } from "@/components/pagination";
import { LoadsMap } from "@/components/map/loads-map";
import { NearbyLoads } from "@/components/nearby-loads";

export const metadata: Metadata = { title: "Yük İlanları" };

type MapRow = LoadCardData & { from_province_code: number; pickup_point: unknown };

function segmentClass(active: boolean) {
  return `flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${
    active ? "bg-white text-brand-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
  }`;
}

export default async function LoadsPage({ searchParams }: PageProps<"/ilanlar">) {
  const sp = await searchParams;
  const filters = readFilters(sp);
  const normalized = normalizeFilters(filters);
  const view: ListView = pickParam(sp, "gorunum") === "harita" ? "harita" : "liste";
  const sort: ListSort = view === "liste" && pickParam(sp, "sirala") === "yakin" ? "yakin" : "yeni";
  const centerProvince = sort === "yakin" ? validProvince(pickParam(sp, "merkez")) : null;
  const pageRaw = Number(pickParam(sp, "sayfa") || "1");
  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? Math.min(pageRaw, 500) : 1;

  const filterParams = activeFilterParams(filters);
  const filterCount = Object.keys(filterParams).length;
  const hasFilters = filterCount > 0;

  const viewParams: Record<string, string> = {};
  if (view === "harita") viewParams.gorunum = "harita";
  if (sort === "yakin") viewParams.sirala = "yakin";
  if (centerProvince) viewParams.merkez = String(centerProvince);

  let loads: LoadPublic[] = [];
  let mapLoads: MapLoad[] = [];
  let total = 0;
  let loadError = false;

  if (isSupabaseConfigured() && view === "harita") {
    const supabase = await createClient();
    const query = applyLoadFilters(
      supabase
        .from("loads")
        .select(LOAD_MAP_COLUMNS, { count: "exact" })
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString()),
      normalized,
    );
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(MAP_LOAD_LIMIT);

    if (error) loadError = true;
    total = count ?? 0;
    mapLoads = ((data ?? []) as unknown as MapRow[]).flatMap(({ pickup_point, from_province_code, ...rest }) => {
      const point = pointOrProvince(pickup_point, from_province_code);
      return point ? [{ ...rest, lat: point.lat, lng: point.lng }] : [];
    });
  } else if (isSupabaseConfigured() && sort === "yeni") {
    const supabase = await createClient();
    const query = applyLoadFilters(
      supabase
        .from("loads")
        .select(LOAD_PUBLIC_COLUMNS, { count: "exact" })
        .eq("status", "active")
        .gt("expires_at", new Date().toISOString()),
      normalized,
    );
    const start = (page - 1) * PAGE_SIZE;
    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(start, start + PAGE_SIZE - 1);

    if (error && error.code !== "PGRST103") loadError = true;
    loads = (data ?? []) as unknown as LoadPublic[];
    total = count ?? 0;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const listParams = { ...filterParams };
  const mapParams = { ...filterParams, gorunum: "harita" };
  const newestParams = { ...filterParams };
  const nearbyParams = { ...filterParams, sirala: "yakin" };

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Yük ilanları</h1>
          <p className="text-sm text-slate-600">
            {sort === "yakin" ? "Size en yakın yükler" : `${total} aktif ilan`}
          </p>
        </div>
        <Link href="/ilan-ver" className="btn-primary">
          İlan ver
        </Link>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <nav aria-label="Görünüm" className="flex gap-1 rounded-xl bg-slate-200 p-1">
          <Link href={listHref(listParams)} className={segmentClass(view === "liste")} aria-current={view === "liste" ? "page" : undefined}>
            Liste
          </Link>
          <Link href={listHref(mapParams)} className={segmentClass(view === "harita")} aria-current={view === "harita" ? "page" : undefined}>
            Harita
          </Link>
        </nav>
        {view === "liste" && (
          <nav aria-label="Sıralama" className="flex gap-1 rounded-xl bg-slate-200 p-1">
            <Link href={listHref(newestParams)} className={segmentClass(sort === "yeni")} aria-current={sort === "yeni" ? "page" : undefined}>
              En yeni
            </Link>
            <Link href={listHref(nearbyParams)} className={segmentClass(sort === "yakin")} aria-current={sort === "yakin" ? "page" : undefined}>
              Bana en yakın
            </Link>
          </nav>
        )}
      </div>

      <details className="card mt-3" open={hasFilters}>
        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
          Filtrele {hasFilters ? `(${filterCount})` : ""}
        </summary>
        <form method="get" action="/ilanlar" className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(viewParams).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <div>
            <label htmlFor="nereden" className="field-label">
              Nereden
            </label>
            <select id="nereden" name="nereden" defaultValue={filters.nereden} className="field-input">
              <option value="">Tüm iller</option>
              {PROVINCES_SORTED.map((p) => (
                <option key={p.code} value={String(p.code)}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="nereye" className="field-label">
              Nereye
            </label>
            <select id="nereye" name="nereye" defaultValue={filters.nereye} className="field-input">
              <option value="">Tüm iller</option>
              {PROVINCES_SORTED.map((p) => (
                <option key={p.code} value={String(p.code)}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="arac" className="field-label">
              Araç tipi
            </label>
            <select id="arac" name="arac" defaultValue={filters.arac} className="field-input">
              <option value="">Tümü</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tarih1" className="field-label">
              Yükleme tarihi (başlangıç)
            </label>
            <input id="tarih1" name="tarih1" type="date" defaultValue={filters.tarih1} className="field-input" />
          </div>
          <div>
            <label htmlFor="tarih2" className="field-label">
              Yükleme tarihi (bitiş)
            </label>
            <input id="tarih2" name="tarih2" type="date" defaultValue={filters.tarih2} className="field-input" />
          </div>
          <div>
            <label htmlFor="tonMin" className="field-label">
              En az (ton)
            </label>
            <input id="tonMin" name="tonMin" inputMode="decimal" defaultValue={filters.tonMin} className="field-input" />
          </div>
          <div>
            <label htmlFor="tonMax" className="field-label">
              En çok (ton)
            </label>
            <input id="tonMax" name="tonMax" inputMode="decimal" defaultValue={filters.tonMax} className="field-input" />
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary flex-1">
              Uygula
            </button>
            {hasFilters && (
              <Link href={listHref(viewParams)} className="btn-secondary">
                Temizle
              </Link>
            )}
          </div>
        </form>
      </details>

      {loadError && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">İlanlar yüklenemedi. Lütfen tekrar deneyin.</p>
      )}

      {view === "harita" ? (
        <div className="mt-4">
          {total > MAP_LOAD_LIMIT && (
            <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
              Haritada en yeni {MAP_LOAD_LIMIT} ilan gösteriliyor. Daha azını görmek için filtreleri daraltın.
            </p>
          )}
          <LoadsMap loads={mapLoads} />
        </div>
      ) : sort === "yakin" ? (
        <NearbyLoads
          rpcFilters={nearbyRpcParams(normalized)}
          page={page}
          centerProvince={centerProvince}
          filterParams={filterParams}
        />
      ) : (
        <>
          <div className="mt-4 space-y-3">
            {loads.map((load) => (
              <LoadCard key={load.id} load={load} />
            ))}
            {!loadError && loads.length === 0 && (
              <div className="card text-center text-sm text-slate-600">
                {hasFilters ? "Bu filtrelere uyan ilan bulunamadı." : "Henüz aktif ilan yok."}
              </div>
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} params={filterParams} />
        </>
      )}
    </div>
  );
}
