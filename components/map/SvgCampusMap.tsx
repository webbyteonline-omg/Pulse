"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LocateFixed, Minus, Plus } from "lucide-react";
import {
  CAMPUS_LOCATIONS,
  CATEGORY_COLORS,
  isOnCampus,
  type CampusLocation,
  type LocationCategory,
} from "@/lib/campusLocations";
import type { FriendLocation } from "@/hooks/useFriendLocations";

/** Real coords → SVG canvas (design-spec bounds). */
const MAP_BOUNDS = { north: 28.4525, south: 28.4475, east: 77.588, west: 77.5815 };
const W = 800;
const H = 640;

function toSVG(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MAP_BOUNDS.west) / (MAP_BOUNDS.east - MAP_BOUNDS.west)) * W;
  const y = ((MAP_BOUNDS.north - lat) / (MAP_BOUNDS.north - MAP_BOUNDS.south)) * H;
  return { x, y };
}

/** Deterministic pseudo-random from a string (stable tree placement). */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const BUILDING_SIZE: Record<LocationCategory, [number, number]> = {
  academic: [64, 44],
  hostel: [52, 40],
  food: [34, 26],
  sports: [56, 36],
  gate: [26, 20],
  hangout: [36, 28],
  misc: [28, 22],
};

// Labelled chips for landmark buildings (like the design)
const CHIP_IDS = new Set(["lrc", "a-block", "n-block", "mess", "dominos", "football-ground", "k-block-sports", "bennett-circle", "main-gate"]);

export function SvgCampusMap({
  filter,
  friends,
  userPos,
  onLocate,
  gpsMessage,
  selected,
  onSelect,
}: {
  filter: "all" | LocationCategory;
  friends: FriendLocation[];
  userPos: [number, number] | null;
  onLocate: () => void;
  gpsMessage: string | null;
  selected: CampusLocation | null;
  onSelect: (l: CampusLocation | null) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; startX: number; startY: number; pinch?: number } | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? CAMPUS_LOCATIONS : CAMPUS_LOCATIONS.filter((l) => l.category === filter)),
    [filter]
  );

  // Stable decorative trees
  const trees = useMemo(
    () =>
      Array.from({ length: 46 }).map((_, i) => {
        const h1 = hash(`tree-${i}`);
        return {
          x: (h1 % W) * 0.92 + 20,
          y: (hash(`t2-${i}`) % H) * 0.92 + 16,
          r: 7 + (h1 % 9),
        };
      }),
    []
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, startX: pan.x, startY: pan.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPan({
      x: drag.current.startX + (e.clientX - drag.current.x),
      y: drag.current.startY + (e.clientY - drag.current.y),
    });
  };
  const onPointerUp = () => (drag.current = null);
  const zoomBy = (d: number) => setZoom((z) => Math.min(3, Math.max(0.7, z + d)));

  const userSvg = userPos ? toSVG(userPos[0], userPos[1]) : null;

  return (
    <div className="relative rounded-card overflow-hidden border border-line select-none" style={{ height: "55dvh", background: "#0D1117", touchAction: "none" }}>
      <div
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={(e) => zoomBy(e.deltaY < 0 ? 0.15 : -0.15)}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-full w-full"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center", transition: drag.current ? "none" : "transform .15s ease-out" }}
        >
          <rect width={W} height={H} fill="#0D1117" />

          {/* Walking paths */}
          <g stroke="#1E2030" strokeWidth="14" strokeLinecap="round" fill="none">
            <path d={`M ${toSVG(28.44859, 77.58176).x} ${toSVG(28.44859, 77.58176).y} L ${toSVG(28.4496, 77.5838).x} ${toSVG(28.4496, 77.5838).y} L ${toSVG(28.45109, 77.58395).x} ${toSVG(28.45109, 77.58395).y}`} />
            <path d={`M ${toSVG(28.45109, 77.58395).x} ${toSVG(28.45109, 77.58395).y} L ${toSVG(28.45067, 77.58628).x} ${toSVG(28.45067, 77.58628).y} L ${toSVG(28.45164, 77.587).x} ${toSVG(28.45164, 77.587).y}`} />
            <path d={`M ${toSVG(28.4496, 77.5838).x} ${toSVG(28.4496, 77.5838).y} L ${toSVG(28.44954, 77.58647).x} ${toSVG(28.44954, 77.58647).y} L ${toSVG(28.45028, 77.58706).x} ${toSVG(28.45028, 77.58706).y}`} />
            <path d={`M ${toSVG(28.449436, 77.581226).x} ${toSVG(28.449436, 77.581226).y} L ${toSVG(28.44971, 77.58282).x} ${toSVG(28.44971, 77.58282).y} L ${toSVG(28.4496, 77.5838).x} ${toSVG(28.4496, 77.5838).y}`} />
          </g>

          {/* Trees */}
          <g fill="#16301F" opacity={0.85}>
            {trees.map((t, i) => (
              <circle key={i} cx={t.x} cy={t.y} r={t.r} />
            ))}
          </g>

          {/* Buildings */}
          {visible.map((l) => {
            const { x, y } = toSVG(l.lat, l.lng);
            const [bw, bh] = BUILDING_SIZE[l.category];
            const color = CATEGORY_COLORS[l.category];
            const isSel = selected?.id === l.id;
            return (
              <g key={l.id} onClick={(e) => { e.stopPropagation(); onSelect(isSel ? null : l); }} className="cursor-pointer">
                {/* 3D-ish block: darker base + colored top */}
                <rect x={x - bw / 2 + 3} y={y - bh / 2 + 4} width={bw} height={bh} rx={7} fill="#000" opacity={0.5} />
                <rect
                  x={x - bw / 2}
                  y={y - bh / 2}
                  width={bw}
                  height={bh}
                  rx={7}
                  fill={color}
                  opacity={isSel ? 0.75 : 0.4}
                  stroke={isSel ? color : `${color}66`}
                  strokeWidth={isSel ? 3 : 1.5}
                />
                <text x={x} y={y + 5} textAnchor="middle" fontSize={bh > 30 ? 16 : 12}>
                  {l.icon}
                </text>
                {(CHIP_IDS.has(l.id) || isSel) && (
                  <g>
                    <rect x={x - 46} y={y - bh / 2 - 26} width={92} height={20} rx={10} fill={color} />
                    <text x={x} y={y - bh / 2 - 12} textAnchor="middle" fontSize={10.5} fontWeight={700} fill="#fff">
                      {l.name.length > 16 ? `${l.name.slice(0, 15)}…` : l.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Friends */}
          {friends.map((f) => {
            const { x, y } = toSVG(f.lat, f.lng);
            return (
              <g key={f.userId}>
                <circle cx={x} cy={y} r={15} fill="#43D98C" opacity={0.35} />
                <circle cx={x} cy={y} r={12} fill="#161622" stroke="#43D98C" strokeWidth={2.5} />
                {f.avatarUrl ? (
                  <image href={f.avatarUrl} x={x - 10} y={y - 10} width={20} height={20} clipPath="circle(10px)" />
                ) : (
                  <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#43D98C">
                    {f.name.charAt(0).toUpperCase()}
                  </text>
                )}
                <text x={x} y={y + 26} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#8888A8">
                  {f.name.split(" ")[0]}
                </text>
              </g>
            );
          })}

          {/* You */}
          {userSvg && isOnCampus(userPos![0], userPos![1]) && (
            <g>
              <circle cx={userSvg.x} cy={userSvg.y} r={16} fill="#4FACFE" opacity={0.3}>
                <animate attributeName="r" values="12;22;12" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0.05;0.4" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx={userSvg.x} cy={userSvg.y} r={8} fill="#4FACFE" stroke="#fff" strokeWidth={2.5} />
              <rect x={userSvg.x - 20} y={userSvg.y + 12} width={40} height={17} rx={8.5} fill="#4FACFE" />
              <text x={userSvg.x} y={userSvg.y + 24} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">
                You
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <button onClick={() => zoomBy(0.25)} aria-label="Zoom in" className="grid place-items-center h-10 w-10 rounded-btn clay text-ink">
          <Plus className="h-4 w-4" />
        </button>
        <button onClick={() => zoomBy(-0.25)} aria-label="Zoom out" className="grid place-items-center h-10 w-10 rounded-btn clay text-ink">
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          aria-label="Recenter"
          className="grid place-items-center h-10 w-10 rounded-btn clay text-[10px] font-black text-ink"
        >
          ⌂
        </button>
      </div>

      {/* Locate FAB */}
      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onLocate}
        aria-label="Where am I?"
        className="absolute bottom-4 right-4 z-10 grid place-items-center h-12 w-12 rounded-full bg-pulse-gradient text-white shadow-[0_6px_20px_-4px_#6C63FFAA]"
      >
        <LocateFixed className="h-5 w-5" />
      </motion.button>

      {/* Selected location card */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="absolute bottom-4 left-4 z-10 clay rounded-card px-4 py-3 shadow-xl"
          >
            <p className="text-sm font-bold">{selected.icon} {selected.name}</p>
            <p className="text-[10px] font-bold uppercase mt-0.5" style={{ color: CATEGORY_COLORS[selected.category] }}>
              {selected.category}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gpsMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 clay rounded-full px-4 py-2 text-xs font-bold shadow-xl whitespace-nowrap"
            role="status"
          >
            {gpsMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
