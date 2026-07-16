"use client";

// leaflet/dist/leaflet.css is imported once globally in app/globals.css
// (shared by CampusMap.tsx and FriendsMap.tsx too) — no per-component
// import needed here.
import Link from "next/link";
import { useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { WeatherChip } from "@/components/dashboard/WeatherChip";
import { SvgCampusMap } from "./SvgCampusMap";
import { CityMapMarkers } from "./CityMapMarkers";
import CampusMap, { CAT_COLORS, CAT_EMOJI, type CampusPlace } from "./CampusMap";
import { formatTime } from "@/components/timetable/SlotCard";
import { useTodayClasses } from "@/hooks/useTimetable";
import { useSubjects } from "@/hooks/useAttendance";
import { useFriendLocations } from "@/hooks/useFriendLocations";
import { CAMPUS_CENTER, isOnCampus, type CampusLocation, type LocationCategory } from "@/lib/campusLocations";
import { nowIST } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";

const DARK_TILES = "https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png";
const LIGHT_TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

type Filter = "all" | LocationCategory;
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "academic", label: "🏛️ Academics" },
  { id: "food", label: "🍕 Food" },
  { id: "sports", label: "⚽ Sports" },
  { id: "hostel", label: "🏠 Hostel" },
  { id: "gate", label: "🚪 Gates" },
  { id: "hangout", label: "🎯 Hangout" },
];

/** CampusMap.tsx's 5 categories are a subset of LocationCategory (no
 * "hangout"/"misc") — those two fall back to showing everything on the
 * satellite tab rather than filtering to nothing. */
function toSatelliteFilter(f: Filter): "all" | CampusPlace["cat"] {
  if (f === "hangout" || f === "misc") return "all";
  return f;
}

export function MapView() {
  const theme = useSettingsStore((s) => s.theme);
  const [tab, setTab] = useState<"campus" | "city" | "satellite">("campus");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<CampusLocation | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);
  const gpsTimer = useRef<number | null>(null);
  const { data: friendLocations } = useFriendLocations();
  const { data: todayClasses } = useTodayClasses();
  const { data: subjects } = useSubjects();

  const locateMe = () => {
    if (!("geolocation" in navigator)) return setGpsMessage("GPS not available here");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(p);
        setGpsMessage(isOnCampus(p[0], p[1]) ? "You're on campus 📍" : "You're off campus");
        if (gpsTimer.current) window.clearTimeout(gpsTimer.current);
        gpsTimer.current = window.setTimeout(() => setGpsMessage(null), 3500);
      },
      () => setGpsMessage("Allow location access and retry"),
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  };

  const now = nowIST();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const nextClass = (todayClasses ?? []).find((s) => {
    const [h, m] = s.start_time.split(":").map(Number);
    return (h ?? 0) * 60 + (m ?? 0) > nowMin;
  });
  const nextSubject = nextClass
    ? (subjects ?? []).find((s) => s.id === nextClass.subject_id)
    : undefined;

  return (
    <div>
      {/* Campus | City | Satellite toggle */}
      <div className="flex items-center gap-1 clay rounded-btn p-1 mb-3">
        {(["campus", "city", "satellite"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 h-10 rounded-input text-xs font-bold transition-colors ${
              tab === t ? "clay-purple-btn" : "text-ink-dim"
            }`}
          >
            {t === "campus" ? "🏫 Campus" : t === "city" ? "🗺️ City Map" : "🛰️ Satellite"}
          </button>
        ))}
      </div>

      {/* Category filters — apply to both Campus (SVG) and City (Leaflet) tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mb-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 min-h-[44px] px-3.5 rounded-full text-xs font-bold border transition-colors ${
              filter === f.id ? "clay-purple-btn border-primary" : "bg-card border-line text-ink-dim"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tab === "campus" ? (
        <SvgCampusMap
          filter={filter}
          friends={friendLocations ?? []}
          userPos={userPos}
          onLocate={locateMe}
          gpsMessage={gpsMessage}
          selected={selected}
          onSelect={setSelected}
        />
      ) : tab === "city" ? (
        <div className="rounded-card overflow-hidden border border-line" style={{ height: "55dvh" }}>
          <MapContainer center={CAMPUS_CENTER} zoom={14} minZoom={11} maxZoom={19} className="h-full w-full" zoomControl={false} attributionControl={false}>
            <TileLayer url={theme === "light" ? LIGHT_TILES : DARK_TILES} />
            <CityMapMarkers filter={filter} onSelect={setSelected} userPos={userPos} />
          </MapContainer>
        </div>
      ) : (
        <>
          <div className="rounded-card overflow-hidden border border-line" style={{ height: "55dvh" }}>
            <CampusMap filter={toSatelliteFilter(filter)} />
          </div>
          {/* Legend — satellite imagery has no built-in labels, so the
              color/emoji key matters more here than on the other two tabs. */}
          <div className="flex flex-wrap gap-3 px-4 py-2.5 mt-2 rounded-input clay">
            {Object.entries(CAT_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-[11px] text-ink-dim capitalize">
                  {CAT_EMOJI[cat as CampusPlace["cat"]]} {cat}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Friends on campus */}
      {(friendLocations ?? []).length > 0 && (
        <section className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Friends on Campus</h2>
            <Link href="/friends" className="text-xs font-semibold text-primary">View All</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
            {(friendLocations ?? []).map((f) => (
              <div key={f.userId} className="flex flex-col items-center gap-1.5 shrink-0">
                <span className="h-14 w-14 rounded-full overflow-hidden border-2 border-success">
                  {f.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={f.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="h-full w-full grid place-items-center bg-primary/20 text-primary font-bold text-lg">
                      {f.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-semibold max-w-[64px] truncate">{f.name}</span>
                <Badge color={f.area === "campus" ? "#43D98C" : "#8888A8"}>
                  {f.area === "campus" ? "Campus" : "Outside"}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom cards: Next Class + Weather */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <Link href="/attendance">
          <Card interactive className="p-4 h-full">
            <span className="grid place-items-center h-9 w-9 rounded-btn bg-primary-dim mb-2">
              <BookOpen className="h-4 w-4 text-primary" />
            </span>
            {nextClass && nextSubject ? (
              <>
                <p className="text-sm font-bold">{formatTime(nextClass.start_time)}</p>
                <p className="text-xs text-ink-dim truncate">
                  {nextSubject.name}
                  {nextClass.room ? ` · ${nextClass.room}` : ""}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-bold">Next Class</p>
                <p className="text-xs text-ink-dim">No more classes today</p>
              </>
            )}
          </Card>
        </Link>
        <Card className="p-4 flex items-center justify-center">
          <WeatherChip />
        </Card>
      </div>
    </div>
  );
}

export default MapView;
