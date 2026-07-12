"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";

export interface CampusPlace {
  name: string;
  lat: number;
  lng: number;
  cat: "gate" | "academic" | "hostel" | "food" | "sports";
}

export const PLACES: CampusPlace[] = [
  { name: "Main Gate", lat: 28.44859, lng: 77.58176, cat: "gate" },
  { name: "Gate 2", lat: 28.449436, lng: 77.581226, cat: "gate" },
  { name: "Gate 3", lat: 28.451644, lng: 77.587003, cat: "gate" },
  { name: "A Block", lat: 28.450279, lng: 77.584189, cat: "academic" },
  { name: "B Block", lat: 28.449793, lng: 77.584408, cat: "academic" },
  { name: "N Block", lat: 28.44892, lng: 77.583552, cat: "academic" },
  { name: "P Block", lat: 28.44971, lng: 77.582823, cat: "academic" },
  { name: "LRC Library", lat: 28.449293, lng: 77.584133, cat: "academic" },
  { name: "H Block", lat: 28.450714, lng: 77.587302, cat: "academic" },
  { name: "Bennett Circle", lat: 28.451096, lng: 77.58395, cat: "academic" },
  { name: "German Hanger 1", lat: 28.449435, lng: 77.583283, cat: "academic" },
  { name: "German Hanger 2", lat: 28.449015, lng: 77.582621, cat: "academic" },
  { name: "D4", lat: 28.44982, lng: 77.585475, cat: "academic" },
  { name: "D5", lat: 28.449841, lng: 77.585757, cat: "academic" },
  { name: "D6", lat: 28.450333, lng: 77.585743, cat: "academic" },
  { name: "Lost & Found", lat: 28.450756, lng: 77.584693, cat: "academic" },
  { name: "C1 Hostel", lat: 28.45047, lng: 77.584464, cat: "hostel" },
  { name: "C12 Hostel", lat: 28.451627, lng: 77.586365, cat: "hostel" },
  { name: "Paid Mess", lat: 28.449364, lng: 77.583877, cat: "food" },
  { name: "Mess", lat: 28.450673, lng: 77.586285, cat: "food" },
  { name: "Dominos", lat: 28.448742, lng: 77.583155, cat: "food" },
  { name: "SnapEats", lat: 28.449376, lng: 77.584383, cat: "food" },
  { name: "House of Chow", lat: 28.449151, lng: 77.584516, cat: "food" },
  { name: "Truck Food", lat: 28.451537, lng: 77.583756, cat: "food" },
  { name: "Maggie Point", lat: 28.450596, lng: 77.585032, cat: "food" },
  { name: "Southern Stories", lat: 28.450417, lng: 77.585193, cat: "food" },
  { name: "Tuck Shop", lat: 28.45137, lng: 77.585296, cat: "food" },
  { name: "Quench", lat: 28.450472, lng: 77.586765, cat: "food" },
  { name: "Football Ground", lat: 28.449543, lng: 77.586473, cat: "sports" },
  { name: "K Block Sports", lat: 28.450282, lng: 77.587058, cat: "sports" },
  { name: "Swimming Pool", lat: 28.450132, lng: 77.587544, cat: "sports" },
  { name: "Basketball Court", lat: 28.450056, lng: 77.586948, cat: "sports" },
  { name: "Tennis Court", lat: 28.449617, lng: 77.587351, cat: "sports" },
  { name: "Volleyball Court", lat: 28.451165, lng: 77.586833, cat: "sports" },
  { name: "Pickleball 1", lat: 28.451033, lng: 77.586659, cat: "sports" },
  { name: "Pickleball 2", lat: 28.449482, lng: 77.587068, cat: "sports" },
  { name: "C11 Badminton", lat: 28.451254, lng: 77.585809, cat: "sports" },
];

export const CAT_COLORS: Record<CampusPlace["cat"], string> = {
  academic: "#6C63FF",
  hostel: "#43D98C",
  food: "#FFB347",
  sports: "#4FACFE",
  gate: "#FF6584",
};

export const CAT_EMOJI: Record<CampusPlace["cat"], string> = {
  academic: "🏛",
  hostel: "🏠",
  food: "🍕",
  sports: "⚽",
  gate: "🚪",
};

export interface CampusMapProps {
  /** Category to show, or "all". Defaults to "all". */
  filter?: "all" | CampusPlace["cat"];
}

/**
 * Satellite (Esri World Imagery) campus map with custom category-colored
 * markers. Built with the imperative Leaflet API (not react-leaflet) and a
 * runtime `import('leaflet')` so it never touches `window` during SSR.
 */
export default function CampusMap({ filter = "all" }: CampusMapProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<unknown[]>([]);

  // Init map + tiles once.
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center: [28.4499, 77.5842],
        zoom: 17,
        zoomControl: false,
        attributionControl: false,
        maxZoom: 20,
        minZoom: 15,
      });
      mapRef.current = map;

      // Satellite tile layer — Esri World Imagery, free, no API key.
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { attribution: "Esri World Imagery", maxZoom: 20, maxNativeZoom: 19 }
      ).addTo(map);

      L.control.attribution({ prefix: false }).addAttribution("© Esri").addTo(map);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render markers whenever the filter (or the map) changes.
  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current) return;

      // Clear previous markers before redrawing for the new filter.
      markersRef.current.forEach((m) => (m as L.Marker).remove());
      markersRef.current = [];

      const visible = filter === "all" ? PLACES : PLACES.filter((p) => p.cat === filter);

      visible.forEach((place) => {
        const color = CAT_COLORS[place.cat];
        const emoji = CAT_EMOJI[place.cat];

        const markerHtml = `
          <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
            <div style="
              width:36px;height:36px;border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              background:${color};
              border:3px solid white;
              box-shadow:0 0 12px ${color}88;
              display:flex;align-items:center;justify-content:center;
            ">
              <span style="transform:rotate(45deg);font-size:14px;line-height:1;">${emoji}</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: "",
          iconSize: [36, 44],
          iconAnchor: [18, 44],
          popupAnchor: [0, -44],
        });

        const marker = L.marker([place.lat, place.lng], { icon });

        const popupContent = `
          <div style="
            background:#1C1C2E;border-radius:12px;padding:12px 16px;
            min-width:140px;font-family:Inter,sans-serif;
          ">
            <p style="color:white;font-size:14px;font-weight:700;margin:0 0 4px;">${place.name}</p>
            <span style="
              background:${color}22;color:${color};font-size:11px;font-weight:600;
              padding:2px 8px;border-radius:20px;border:1px solid ${color}44;
            ">${place.cat.charAt(0).toUpperCase() + place.cat.slice(1)}</span>
          </div>
        `;

        marker.bindPopup(popupContent, { closeButton: false, className: "pulse-popup", maxWidth: 200 });
        marker.addTo(mapRef.current!);
        markersRef.current.push(marker);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        ref={containerRef}
        style={{ flex: 1, borderRadius: "16px", overflow: "hidden", minHeight: 400 }}
      />
    </div>
  );
}
