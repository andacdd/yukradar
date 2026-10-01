"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Polyline, TileLayer, Tooltip } from "react-leaflet";
import { L, OSM_ATTRIBUTION, OSM_TILE_URL, deliveryIcon, pickupIcon } from "./leaflet-setup";
import type { RouteMapProps } from "./route-map";

export default function RouteMapInner({ pickup, delivery, pickupLabel, deliveryLabel }: RouteMapProps) {
  const samePoint = pickup.lat === delivery.lat && pickup.lng === delivery.lng;
  const bounds = L.latLngBounds([pickup, delivery]).pad(0.4);

  return (
    <MapContainer
      {...(samePoint ? { center: pickup, zoom: 9 } : { bounds })}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      {!samePoint && (
        <Polyline positions={[pickup, delivery]} pathOptions={{ color: "#1d4ed8", weight: 3, dashArray: "8 8" }} />
      )}
      <Marker position={pickup} icon={pickupIcon}>
        <Tooltip direction="top" offset={[0, -36]} permanent={!samePoint}>
          Alım: {pickupLabel}
        </Tooltip>
      </Marker>
      {!samePoint && (
        <Marker position={delivery} icon={deliveryIcon}>
          <Tooltip direction="top" offset={[0, -36]} permanent>
            Teslim: {deliveryLabel}
          </Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}
