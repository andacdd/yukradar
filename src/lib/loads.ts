import { getProvince, provincePointEWKT } from "@/lib/data/provinces";
import { normalizeTrPhone } from "@/lib/phone";
import { parseDecimal, type LoadFormValues } from "@/lib/validation";

export const LOAD_PUBLIC_COLUMNS =
  "id, source, source_group, from_province_code, from_province, from_district, to_province_code, to_province, to_district, cargo_type, weight_tons, vehicle_type, load_date, price, currency, description, status, created_at, expires_at";

export const LOAD_OWNER_COLUMNS = `${LOAD_PUBLIC_COLUMNS}, owner_id, contact_phone`;

export type LoadPublic = {
  id: string;
  source: "user" | "whatsapp";
  source_group: string | null;
  from_province_code: number;
  from_province: string;
  from_district: string | null;
  to_province_code: number;
  to_province: string;
  to_district: string | null;
  cargo_type: string;
  weight_tons: number;
  vehicle_type: string;
  load_date: string;
  price: number | null;
  currency: string;
  description: string | null;
  status: "active" | "found" | "removed";
  created_at: string;
  expires_at: string;
};

export type LoadOwned = LoadPublic & { owner_id: string | null; contact_phone: string };

export const LOAD_DETAIL_COLUMNS = `${LOAD_PUBLIC_COLUMNS}, pickup_point, delivery_point`;

export type LoadDetail = LoadPublic & { pickup_point: unknown; delivery_point: unknown };

export type LoadCardData = Pick<
  LoadPublic,
  | "id"
  | "source"
  | "from_province"
  | "from_district"
  | "to_province"
  | "to_district"
  | "cargo_type"
  | "weight_tons"
  | "vehicle_type"
  | "load_date"
  | "price"
  | "currency"
  | "created_at"
>;

export const LOAD_MAP_COLUMNS =
  "id, source, from_province_code, from_province, from_district, to_province, to_district, cargo_type, weight_tons, vehicle_type, load_date, price, currency, created_at, pickup_point";

export const MAP_LOAD_LIMIT = 500;

export type MapLoad = LoadCardData & { lat: number; lng: number };

export type NearbyLoad = LoadPublic & { distance_km: number | null; total_count: number };

export const PAGE_SIZE = 20;

export function buildLoadPayload(values: LoadFormValues) {
  const fromCode = Number(values.from_province_code);
  const toCode = Number(values.to_province_code);
  const from = getProvince(fromCode);
  const to = getProvince(toCode);
  const phone = normalizeTrPhone(values.contact_phone);
  const weight = parseDecimal(values.weight_tons);
  if (!from || !to || !phone || weight === null) return null;
  const price = values.price.trim() === "" ? null : parseDecimal(values.price);
  return {
    from_province_code: fromCode,
    from_province: from.name,
    from_district: values.from_district.trim() || null,
    to_province_code: toCode,
    to_province: to.name,
    to_district: values.to_district.trim() || null,
    pickup_point: provincePointEWKT(fromCode),
    delivery_point: provincePointEWKT(toCode),
    cargo_type: values.cargo_type.trim(),
    weight_tons: weight,
    vehicle_type: values.vehicle_type,
    load_date: values.load_date,
    price,
    description: values.description.trim() || null,
    contact_phone: phone,
  };
}

export function loadToFormValues(load: LoadOwned): LoadFormValues {
  return {
    from_province_code: String(load.from_province_code),
    from_district: load.from_district ?? "",
    to_province_code: String(load.to_province_code),
    to_district: load.to_district ?? "",
    cargo_type: load.cargo_type,
    weight_tons: String(load.weight_tons).replace(".", ","),
    vehicle_type: load.vehicle_type as LoadFormValues["vehicle_type"],
    load_date: load.load_date,
    price: load.price === null ? "" : String(load.price).replace(".", ","),
    description: load.description ?? "",
    contact_phone: load.contact_phone,
  };
}

export function formatPrice(price: number | null, currency = "TRY"): string {
  if (price === null) return "Teklif usulü";
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export function formatDate(iso: string): string {
  const d = iso.length === 10 ? new Date(`${iso}T12:00:00Z`) : new Date(iso);
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" }).format(d);
}

export function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return "az önce";
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.round(hours / 24);
  return `${days} gün önce`;
}

export function formatWeight(tons: number): string {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(tons)} ton`;
}

export function routeLabel(load: Pick<LoadPublic, "from_province" | "from_district" | "to_province" | "to_district">) {
  const from = load.from_district ? `${load.from_province} / ${load.from_district}` : load.from_province;
  const to = load.to_district ? `${load.to_province} / ${load.to_district}` : load.to_province;
  return { from, to };
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}
