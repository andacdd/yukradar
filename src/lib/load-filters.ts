import { LOAD_VEHICLE_TYPE_VALUES } from "@/lib/data/options";
import { parseDecimal } from "@/lib/validation";

export type SearchParamsRecord = Record<string, string | string[] | undefined>;

export const FILTER_KEYS = ["nereden", "nereye", "arac", "tarih1", "tarih2", "tonMin", "tonMax"] as const;

export type FilterKey = (typeof FILTER_KEYS)[number];

export type LoadFilters = Record<FilterKey, string>;

export type NormalizedFilters = {
  fromProvince: number | null;
  toProvince: number | null;
  vehicleType: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  minTons: number | null;
  maxTons: number | null;
};

export type ListView = "liste" | "harita";
export type ListSort = "yeni" | "yakin";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function pickParam(sp: SearchParamsRecord, key: string): string {
  const v = sp[key];
  return typeof v === "string" ? v.trim() : "";
}

export function validProvince(v: string): number | null {
  if (!/^\d{1,2}$/.test(v)) return null;
  const n = Number(v);
  return n >= 1 && n <= 81 ? n : null;
}

export function readFilters(sp: SearchParamsRecord): LoadFilters {
  return Object.fromEntries(FILTER_KEYS.map((k) => [k, pickParam(sp, k)])) as LoadFilters;
}

export function activeFilterParams(filters: LoadFilters): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of FILTER_KEYS) if (filters[k]) out[k] = filters[k];
  return out;
}

export function normalizeFilters(filters: LoadFilters): NormalizedFilters {
  const vehicleOk =
    (LOAD_VEHICLE_TYPE_VALUES as readonly string[]).includes(filters.arac) && filters.arac !== "farketmez";
  return {
    fromProvince: validProvince(filters.nereden),
    toProvince: validProvince(filters.nereye),
    vehicleType: vehicleOk ? filters.arac : null,
    dateFrom: DATE_RE.test(filters.tarih1) ? filters.tarih1 : null,
    dateTo: DATE_RE.test(filters.tarih2) ? filters.tarih2 : null,
    minTons: parseDecimal(filters.tonMin),
    maxTons: parseDecimal(filters.tonMax),
  };
}

type FilterableQuery = {
  eq(column: string, value: string | number): FilterableQuery;
  in(column: string, values: string[]): FilterableQuery;
  gte(column: string, value: string | number): FilterableQuery;
  lte(column: string, value: string | number): FilterableQuery;
};

export function applyLoadFilters<T>(query: T, f: NormalizedFilters): T {
  let q = query as unknown as FilterableQuery;
  if (f.fromProvince) q = q.eq("from_province_code", f.fromProvince);
  if (f.toProvince) q = q.eq("to_province_code", f.toProvince);
  if (f.vehicleType) q = q.in("vehicle_type", [f.vehicleType, "farketmez"]);
  if (f.dateFrom) q = q.gte("load_date", f.dateFrom);
  if (f.dateTo) q = q.lte("load_date", f.dateTo);
  if (f.minTons !== null) q = q.gte("weight_tons", f.minTons);
  if (f.maxTons !== null) q = q.lte("weight_tons", f.maxTons);
  return q as unknown as T;
}

export function nearbyRpcParams(f: NormalizedFilters) {
  return {
    p_from_province: f.fromProvince,
    p_to_province: f.toProvince,
    p_vehicle_type: f.vehicleType,
    p_date_from: f.dateFrom,
    p_date_to: f.dateTo,
    p_min_tons: f.minTons,
    p_max_tons: f.maxTons,
  };
}

export function listHref(params: Record<string, string>): string {
  const qs = new URLSearchParams(params).toString();
  return qs ? `/ilanlar?${qs}` : "/ilanlar";
}
