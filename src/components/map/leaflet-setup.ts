import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

export const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> katkıcıları';

export const TURKEY_CENTER: L.LatLngTuple = [39.0, 35.2];
export const TURKEY_ZOOM = 5;

function assetUrl(asset: string | { src: string } | { default: { src: string } }): string {
  if (typeof asset === "string") return asset;
  if ("src" in asset) return asset.src;
  return asset.default.src;
}

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: assetUrl(iconUrl),
  iconRetinaUrl: assetUrl(iconRetinaUrl),
  shadowUrl: assetUrl(shadowUrl),
});

export const pickupIcon = new L.Icon.Default();
export const deliveryIcon = new L.Icon.Default({ className: "leaflet-marker-delivery" });

export { L };
