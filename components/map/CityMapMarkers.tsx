"use client";

import { useMemo } from "react";
import L from "leaflet";
import { Marker, Popup, CircleMarker } from "react-leaflet";
import {
  CAMPUS_LOCATIONS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  type CampusLocation,
  type LocationCategory,
} from "@/lib/campusLocations";

/** Colored emoji pin — avoids bundling Leaflet's default marker PNGs and
 * matches the SvgCampusMap's per-category color coding. */
function pinIcon(location: CampusLocation): L.DivIcon {
  const color = CATEGORY_COLORS[location.category];
  return L.divIcon({
    className: "",
    html: `<div style="
        display:grid;place-items:center;
        height:30px;width:30px;border-radius:50% 50% 50% 0;
        background:${color};
        transform:rotate(-45deg);
        box-shadow:0 2px 6px rgba(0,0,0,0.35);
        border:2px solid rgba(255,255,255,0.85);
      ">
        <span style="transform:rotate(45deg);font-size:14px;line-height:1;">${location.icon}</span>
      </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 28],
    popupAnchor: [0, -26],
  });
}

export function CityMapMarkers({
  filter,
  onSelect,
  userPos,
}: {
  filter: "all" | LocationCategory;
  onSelect?: (location: CampusLocation) => void;
  userPos: [number, number] | null;
}) {
  const visible = useMemo(
    () => (filter === "all" ? CAMPUS_LOCATIONS : CAMPUS_LOCATIONS.filter((l) => l.category === filter)),
    [filter]
  );

  return (
    <>
      {visible.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lng]}
          icon={pinIcon(loc)}
          eventHandlers={onSelect ? { click: () => onSelect(loc) } : undefined}
        >
          <Popup>
            <div style={{ fontSize: 12, fontWeight: 600 }}>
              {loc.icon} {loc.name}
              <div style={{ fontSize: 10, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>
                {CATEGORY_LABELS[loc.category]}
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {userPos && (
        <CircleMarker
          center={userPos}
          radius={8}
          pathOptions={{ color: "#6C63FF", fillColor: "#6C63FF", fillOpacity: 0.9, weight: 3 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>
      )}
    </>
  );
}
