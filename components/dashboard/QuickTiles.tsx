"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, BriefcaseBusiness, Footprints, NotebookPen } from "lucide-react";
import { formatINR } from "@/lib/utils";

export interface QuickTilesProps {
  attendancePct: number | null;
  attendanceDelta?: number | null;
  todaySpend: number;
  tasksDue: number;
  stepsToday: number | null;
}

/** Mockup-style 4-tile quick stats row: Attendance / Finance / Study / Health. */
export function QuickTiles({
  attendancePct,
  attendanceDelta,
  todaySpend,
  tasksDue,
  stepsToday,
}: QuickTilesProps) {
  const tiles = [
    {
      href: "/attendance",
      label: "Attendance",
      value: attendancePct !== null ? `${Math.round(attendancePct)}%` : "—",
      sub:
        attendanceDelta !== null && attendanceDelta !== undefined && attendanceDelta !== 0
          ? `${attendanceDelta > 0 ? "↑" : "↓"} ${Math.abs(attendanceDelta)}%`
          : undefined,
      subTone: (attendanceDelta ?? 0) >= 0 ? "text-success" : "text-danger",
      icon: BarChart3,
      color: "#43D98C",
    },
    {
      href: "/finance",
      label: "Finance",
      value: formatINR(todaySpend),
      sub: "Spent Today",
      subTone: "text-ink-faint",
      icon: BriefcaseBusiness,
      color: "#FFB347",
    },
    {
      href: "/academic",
      label: "Study",
      value: String(tasksDue),
      sub: tasksDue === 1 ? "Task Due" : "Tasks Due",
      subTone: "text-ink-faint",
      icon: NotebookPen,
      color: "#6C63FF",
    },
    {
      href: "/health",
      label: "Health",
      value: stepsToday !== null ? stepsToday.toLocaleString("en-IN") : "—",
      sub: "Steps Today",
      subTone: "text-ink-faint",
      icon: Footprints,
      color: "#FF6584",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-6">
      {tiles.map((tile, i) => (
        <Link key={tile.label} href={tile.href}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            whileTap={{ scale: 0.95 }}
            className="bg-card border border-line rounded-card px-2 py-3 flex flex-col items-center text-center h-full"
          >
            <span
              className="grid place-items-center h-8 w-8 rounded-lg mb-1.5"
              style={{ backgroundColor: `${tile.color}1f` }}
            >
              <tile.icon className="h-4 w-4" style={{ color: tile.color }} />
            </span>
            <p className="text-[10px] font-semibold text-ink-dim leading-none">{tile.label}</p>
            <p className="mt-1 text-sm font-black tabular-nums leading-tight truncate w-full">
              {tile.value}
            </p>
            {tile.sub && (
              <p className={`text-[9px] font-bold leading-tight ${tile.subTone}`}>{tile.sub}</p>
            )}
          </motion.div>
        </Link>
      ))}
    </div>
  );
}
