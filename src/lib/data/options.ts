export const VEHICLE_TYPES = [
  { value: "tir", label: "Tır" },
  { value: "kirkayak", label: "Kırkayak" },
  { value: "kamyon", label: "Kamyon" },
  { value: "kamyonet", label: "Kamyonet" },
  { value: "panelvan", label: "Panelvan" },
  { value: "frigorifik", label: "Frigorifik (soğutuculu)" },
  { value: "lowbed", label: "Lowbed" },
  { value: "diger", label: "Diğer" },
] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number]["value"];

export const LOAD_VEHICLE_TYPES = [...VEHICLE_TYPES, { value: "farketmez", label: "Farketmez" }] as const;

export type LoadVehicleType = (typeof LOAD_VEHICLE_TYPES)[number]["value"];

export const VEHICLE_TYPE_VALUES = VEHICLE_TYPES.map((v) => v.value) as [VehicleType, ...VehicleType[]];
export const LOAD_VEHICLE_TYPE_VALUES = LOAD_VEHICLE_TYPES.map((v) => v.value) as [
  LoadVehicleType,
  ...LoadVehicleType[],
];

export function vehicleLabel(value: string | null | undefined): string {
  return LOAD_VEHICLE_TYPES.find((v) => v.value === value)?.label ?? "-";
}

export const ROLES = [
  { value: "shipper", label: "Yük sahibi", hint: "Taşınacak yüküm var, ilan veririm" },
  { value: "carrier", label: "Araç sahibi", hint: "Aracım var, yük ararım" },
  { value: "both", label: "İkisi de", hint: "Hem yük veririm hem taşırım" },
] as const;

export type Role = (typeof ROLES)[number]["value"];

export const CARGO_SUGGESTIONS = [
  "Paletli yük",
  "Parsiyel",
  "Dökme",
  "Konteyner",
  "Gıda",
  "Soğuk zincir",
  "İnşaat malzemesi",
  "Demir çelik",
  "Tekstil",
  "Beyaz eşya",
  "Mobilya",
  "Tarım ürünü",
  "Hayvan yemi",
  "Makine",
  "Kimyasal",
] as const;

export const LOAD_STATUS_LABELS: Record<string, string> = {
  active: "Yayında",
  found: "Yük bulundu",
  removed: "Kaldırıldı",
};
