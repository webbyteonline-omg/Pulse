"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Grid3X3, XCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { attendancePercent, bunkStats } from "@/lib/utils";
import type { Subject } from "@/lib/supabase/types";

/** Design screen 2: overall donut + attended/missed/total + safe-to-miss banner. */
export function OverallCard({ subjects }: { subjects: Subject[] }) {
  const attended = subjects.reduce((s, x) => s + x.attended_classes, 0);
  const total = subjects.reduce((s, x) => s + x.total_classes, 0);
  if (total === 0) return null;

  const pct = attendancePercent(attended, total);
  const required = Math.round(
    subjects.reduce((s, x) => s + x.required_percentage, 0) / Math.max(1, subjects.length)
  );
  const { canMiss } = bunkStats(attended, total, required);
  const color = pct >= required + 5 ? "#43D98C" : pct >= required ? "#FFB347" : "#FF5C5C";
  const status = pct >= required + 5 ? "Good" : pct >= required ? "On edge" : "At risk";

  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <Card className="p-5 mb-5">
      <h2 className="text-lg font-semibold mb-4">Overall Attendance</h2>
      <div className="flex items-center gap-5">
        {/* Donut */}
        <div className="relative grid place-items-center shrink-0" style={{ width: 128, height: 128 }}>
          <svg width={128} height={128} className="-rotate-90">
            <circle cx={64} cy={64} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={12} />
            <motion.circle
              cx={64} cy={64} r={r} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
              strokeDasharray={c}
              initial={{ strokeDashoffset: c }}
              animate={{ strokeDashoffset: c * (1 - Math.min(100, pct) / 100) }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-black tabular-nums">{Math.round(pct)}%</p>
            <p className="text-[10px] font-bold" style={{ color }}>● {status}</p>
          </div>
        </div>

        {/* Stat rows */}
        <div className="flex-1 space-y-2.5">
          {[
            { label: "Classes Attended", value: attended, icon: CheckCircle2, color: "#43D98C" },
            { label: "Classes Missed", value: total - attended, icon: XCircle, color: "#FF5C5C" },
            { label: "Total Classes", value: total, icon: Grid3X3, color: "#6C63FF" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 bg-input border border-line rounded-input px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-ink-dim font-semibold">{s.label}</p>
                <p className="text-base font-black tabular-nums leading-tight">{s.value}</p>
              </div>
              <s.icon className="h-4.5 w-4.5 shrink-0" style={{ color: s.color, height: 18, width: 18 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Banner */}
      <div
        className={`mt-4 flex items-center gap-2 rounded-btn px-3.5 py-2.5 text-xs font-bold ${
          pct >= required ? "bg-success-dim text-success" : "bg-danger-dim text-danger"
        }`}
      >
        <span className="flex-1">
          {pct >= required
            ? `Great job! You can miss ${canMiss} more ${canMiss === 1 ? "class" : "classes"}`
            : `Below ${required}% — attend your next classes to recover`}
        </span>
        <ChevronRight className="h-3.5 w-3.5" />
      </div>
    </Card>
  );
}
