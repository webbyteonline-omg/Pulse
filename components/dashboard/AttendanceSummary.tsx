"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { attendanceHealth, attendancePercent } from "@/lib/utils";
import type { Subject } from "@/lib/supabase/types";

const HEALTH_COLORS = { good: "#43D98C", warning: "#FFB347", danger: "#FF5C5C" } as const;

/** Vertical list: subject + mini progress bar + percentage. */
export function AttendanceSummary({ subjects }: { subjects: Subject[] }) {
  if (subjects.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">Attendance</h2>
        <Link href="/attendance" className="text-xs font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="bg-card border border-line rounded-card divide-y divide-line">
        {subjects.slice(0, 5).map((subject, i) => {
          const pct = attendancePercent(subject.attended_classes, subject.total_classes);
          const health = attendanceHealth(
            subject.attended_classes,
            subject.total_classes,
            subject.required_percentage
          );
          const color = HEALTH_COLORS[health];
          return (
            <Link
              key={subject.id}
              href={`/attendance/${subject.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors first:rounded-t-card last:rounded-b-card"
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: subject.color }}
              />
              <span className="flex-1 min-w-0 text-sm font-medium truncate">{subject.name}</span>
              <div className="w-20 h-1.5 rounded-full bg-line overflow-hidden shrink-0">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, pct)}%` }}
                  transition={{ delay: 0.05 + i * 0.03, duration: 0.2, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <span className="w-12 text-right text-sm font-bold tabular-nums" style={{ color }}>
                {subject.total_classes === 0 ? "—" : `${pct}%`}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
