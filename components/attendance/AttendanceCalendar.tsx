"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAttendanceLogs } from "@/hooks/useAttendance";
import { monthLabel, todayIST } from "@/lib/utils";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Monthly calendar: green dot = present, red = absent, grey = no class. */
export function AttendanceCalendar({ subjectId }: { subjectId: string }) {
  const today = todayIST();
  const [ty, tm] = today.split("-").map(Number);
  const [year, setYear] = useState(ty ?? 2026);
  const [month, setMonth] = useState(tm ?? 1);

  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const logsQuery = useAttendanceLogs(subjectId, monthKey);

  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  // Monday-first offset
  const firstWeekday = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;

  const statusByDay = new Map<number, "present" | "absent">();
  for (const log of logsQuery.data ?? []) {
    const day = Number(log.date.split("-")[2]);
    // If multiple classes in a day: absent wins visibility (needs attention)
    const existing = statusByDay.get(day);
    statusByDay.set(day, existing === "absent" ? "absent" : log.status);
  }

  const navigate = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wider">History</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(-1)}
            aria-label="Previous month"
            className="p-1.5 rounded-input text-ink-dim hover:text-ink hover:bg-line/50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold w-32 text-center">
            {monthLabel(month, year)}
          </span>
          <button
            onClick={() => navigate(1)}
            aria-label="Next month"
            className="p-1.5 rounded-input text-ink-dim hover:text-ink hover:bg-line/50 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {logsQuery.isLoading ? (
        <Skeleton className="h-44 w-full" />
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-ink-faint">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const iso = `${monthKey}-${String(day).padStart(2, "0")}`;
              const status = statusByDay.get(day);
              const isToday = iso === today;
              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.008 * day }}
                  className={`aspect-square rounded-lg grid place-items-center text-[11px] tabular-nums border ${
                    isToday ? "border-primary/60" : "border-transparent"
                  }`}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={status ? "text-ink" : "text-ink-faint"}>{day}</span>
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          status === "present"
                            ? "#43D98C"
                            : status === "absent"
                              ? "#FF5C5C"
                              : "#2A2A3A",
                      }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-[11px] text-ink-dim">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" /> Present
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" /> Absent
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-line" /> No class
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
