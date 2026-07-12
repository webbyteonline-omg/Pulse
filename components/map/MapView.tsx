"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { AnimatePresence, motion } from "framer-motion";
import { LocateFixed } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  CAMPUS_CENTER,
  CAMPUS_LOCATIONS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  isOnCampus,
  type CampusLocation,
  type LocationCategory,
} from "@/lib/campusLocations";
import { useFriendLocations, type FriendLocation } from "@/hooks/useFriendLocations";
import { useSettingsStore } from "@/store/settingsStore";

const DARK_TILES = "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";
const LIGHT_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

type Filter = "all" | LocationCategory;

const FILTERS: Array<{ id: Filter; label: string; emoji: string }> = [
  { id: "all", label: "All", emoji: "✨" },
  { id: "gate", label: "Gates", emoji: "🚪" },
  { id: "academic", label: "Academic", emoji: "🏛️" },
  { id: "hostel", label: "Hostel", emoji: "🏠" },
  { id: "food", label: "Food", emoji: "🍕" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "hangout", label: "Hangout", emoji: "🎯" },
];

function locationIcon(location: CampusLocation, selected: boolean): L.DivIcon {
  const color = CATEGORY_COLORS[location.category];
  const size = selected ? 42 : 32;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};display:flex;align-items:center;justify-content:center;
      font-size:${selected ? 20 : 15}px;border:2.5px solid #fff;
      box-shadow:${selected ? `0 0 0 5px ${color}55, 0 4px 14px rgba(0,0,0,.5)` : "0 2px 8px rgba(0,0,0,.4)"};
      transition:all .15s ease;">${location.icon}</div>`,
  });
}

function friendIcon(friend: FriendLocation): L.DivIcon {
  const inner = friend.avatarUrl
    ? `<img src="${friend.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" alt=""/>`
    : `<div style="width:100%;height:100%;background:#6C63FF;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:15px;">${friend.name.charAt(0).toUpperCase()}</div>`;
  return L.divIcon({
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    html: `<div style="width:38px;height:38px;border-radius:50%;overflow:hidden;
      border:3px solid #43D98C;box-shadow:0 0 0 4px #43D98C44, 0 4px 12px rgba(0,0,0,.5);">${inner}</div>`,
  });
}

const userIcon = L.divIcon({
  className: "",
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#5AB0FF;
    border:3px solid #fff;box-shadow:0 0 0 8px #5AB0FF33;animation:pulse-dot 1.6s ease-out infinite;"></div>
    <style>@keyframes pulse-dot{0%{box-shadow:0 0 0 0 #5AB0FF66}100%{box-shadow:0 0 0 16px #5AB0FF00}}</style>`,
});

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 18, { duration: 0.8 });
  }, [target, map]);
  return null;
}

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export function MapView() {
  const theme = useSettingsStore((s) => s.theme);
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const gpsTimer = useRef<number | null>(null);
  const { data: friendLocations } = useFriendLocations();

  const dark = theme !== "light";
  const visible = useMemo(
    () =>
      filter === "all"
        ? CAMPUS_LOCATIONS
        : CAMPUS_LOCATIONS.filter((l) => l.category === filter),
    [filter]
  );

  const locateMe = () => {
    if (!("geolocation" in navigator)) {
      setGpsMessage("Location isn't available in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const target: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(target);
        setFlyTarget(target);
        setGpsMessage(
          isOnCampus(target[0], target[1]) ? "You're on campus 📍" : "You're off campus"
        );
        if (gpsTimer.current) window.clearTimeout(gpsTimer.current);
        gpsTimer.current = window.setTimeout(() => setGpsMessage(null), 3500);
      },
      () => setGpsMessage("Couldn't read GPS — allow location access"),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 min-h-[44px] px-3.5 rounded-full text-xs font-bold border transition-colors ${
              filter === f.id
                ? "bg-primary text-white border-primary"
                : "bg-card border-line text-ink-dim"
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative rounded-card overflow-hidden border border-line" style={{ height: "58dvh" }}>
        <MapContainer
          center={CAMPUS_CENTER}
          zoom={17}
          minZoom={15}
          maxZoom={19}
          className="h-full w-full"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url={dark ? DARK_TILES : LIGHT_TILES} attribution={ATTRIBUTION} />
          <FlyTo target={flyTarget} />

          {visible.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={locationIcon(location, selectedId === location.id)}
              eventHandlers={{ click: () => setSelectedId(location.id) }}
            >
              <Popup closeButton={false}>
                <div style={{ fontFamily: "inherit", minWidth: 130 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>
                    {location.icon} {location.name}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 11,
                      fontWeight: 700,
                      color: CATEGORY_COLORS[location.category],
                      textTransform: "uppercase",
                    }}
                  >
                    {CATEGORY_LABELS[location.category]}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {(friendLocations ?? []).map((friend) => (
            <Marker
              key={friend.userId}
              position={[friend.lat, friend.lng]}
              icon={friendIcon(friend)}
            >
              <Popup closeButton={false}>
                <div style={{ minWidth: 110 }}>
                  <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{friend.name}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11, color: "#888" }}>
                    {timeAgo(friend.updatedAt)} · approx. location
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}

          {userPos && <Marker position={userPos} icon={userIcon} />}
        </MapContainer>

        {/* Where am I FAB */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={locateMe}
          aria-label="Where am I?"
          className="absolute bottom-4 right-4 z-[1000] grid place-items-center h-12 w-12 rounded-full bg-primary text-white shadow-[0_6px_20px_-4px_#6C63FFAA]"
        >
          <LocateFixed className="h-5 w-5" />
        </motion.button>

        {/* GPS toast */}
        <AnimatePresence>
          {gpsMessage && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-card border border-line rounded-full px-4 py-2 text-xs font-bold shadow-xl whitespace-nowrap"
              role="status"
            >
              {gpsMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Friends on campus */}
      {(friendLocations ?? []).length > 0 && (
        <section className="mt-4">
          <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-3">
            Friends on campus
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
            {(friendLocations ?? []).map((friend) => (
              <button
                key={friend.userId}
                onClick={() => setFlyTarget([friend.lat, friend.lng])}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <span className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-success">
                  {friend.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={friend.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="h-full w-full grid place-items-center bg-primary/20 text-primary font-bold text-lg">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-semibold max-w-[64px] truncate">{friend.name}</span>
                <Badge color={friend.area === "campus" ? "#43D98C" : "#8888A0"}>
                  {friend.area === "campus" ? "Campus" : "Outside"}
                </Badge>
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="mt-4 text-center text-[11px] text-ink-faint">
        Friend markers are approximate (~100m) and only shown for friends who share location.
      </p>
    </div>
  );
}

export default MapView;
