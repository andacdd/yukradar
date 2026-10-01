import { getProvince } from "@/lib/data/provinces";

export type LatLng = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371.0088;

function isValid(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

function fromHexEwkb(hex: string): LatLng | null {
  if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0 || hex.length < 42) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  const view = new DataView(bytes.buffer);
  const little = bytes[0] === 1;
  const type = view.getUint32(1, little);
  if ((type & 0x0fffffff) !== 1) return null;
  let offset = 5;
  if (type & 0x20000000) offset += 4;
  if (bytes.length < offset + 16) return null;
  const lng = view.getFloat64(offset, little);
  const lat = view.getFloat64(offset + 8, little);
  return isValid(lat, lng) ? { lat, lng } : null;
}

export function parsePoint(value: unknown): LatLng | null {
  if (!value) return null;
  if (typeof value === "string") {
    const wkt = value.match(/POINT\s*\(\s*(-?[\d.]+)\s+(-?[\d.]+)\s*\)/i);
    if (wkt) {
      const lng = Number(wkt[1]);
      const lat = Number(wkt[2]);
      return isValid(lat, lng) ? { lat, lng } : null;
    }
    return fromHexEwkb(value);
  }
  if (typeof value === "object") {
    const coords = (value as { coordinates?: unknown }).coordinates;
    if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
      return isValid(coords[1], coords[0]) ? { lat: coords[1], lng: coords[0] } : null;
    }
  }
  return null;
}

export function provinceCenter(code: number): LatLng | null {
  const p = getProvince(code);
  return p ? { lat: p.lat, lng: p.lng } : null;
}

export function pointOrProvince(value: unknown, provinceCode: number): LatLng | null {
  return parsePoint(value) ?? provinceCenter(provinceCode);
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatKm(km: number): string {
  if (km < 1) return "1 km'den az";
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(km))} km`;
}

export function roundCoord(value: number): number {
  return Math.round(value * 1000) / 1000;
}
