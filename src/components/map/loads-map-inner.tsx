"use client";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { L, OSM_ATTRIBUTION, OSM_TILE_URL, TURKEY_CENTER, TURKEY_ZOOM, pickupIcon } from "./leaflet-setup";
import "leaflet.markercluster";
import type { MapLoad } from "@/lib/loads";

type Props = {
  loads: MapLoad[];
  onSelect: (id: string) => void;
};

function ClusterLayer({ loads, onSelect }: Props) {
  const map = useMap();

  useEffect(() => {
    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      chunkedLoading: true,
    });
    const markers = loads.map((load) =>
      L.marker([load.lat, load.lng], {
        icon: pickupIcon,
        title: `${load.from_province} → ${load.to_province}`,
        alt: `${load.from_province} → ${load.to_province}, ${load.cargo_type}`,
        keyboard: true,
      }).on("click", () => onSelect(load.id)),
    );
    group.addLayers(markers);
    map.addLayer(group);
    if (markers.length > 0) {
      map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 9 });
    }
    return () => {
      map.removeLayer(group);
    };
  }, [map, loads, onSelect]);

  return null;
}

export default function LoadsMapInner({ loads, onSelect }: Props) {
  return (
    <MapContainer center={TURKEY_CENTER} zoom={TURKEY_ZOOM} minZoom={4} className="h-full w-full">
      <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
      <ClusterLayer loads={loads} onSelect={onSelect} />
    </MapContainer>
  );
}
