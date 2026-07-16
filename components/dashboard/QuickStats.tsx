"use client";

import { useEffect, useState } from "react";

interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
  warning?: string;
}

function StatCard({ emoji, label, value, warning }: StatCardProps) {
  return (
    <div className="clay rounded-2xl px-4 py-3.5">
      <p className="text-[12px] mb-1 text-ink-dim">
        {emoji} {label}
      </p>
      <p className="text-[22px] font-bold text-ink">{value}</p>
      {warning && <p className="text-[11px] mt-1 text-danger">⚠ {warning}</p>}
    </div>
  );
}

/** Consecutive-day app-open streak, tracked client-side via localStorage —
 * incremented at most once per calendar day (IST), reset if a day is missed. */
function useOpenStreak(): number {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      const raw = localStorage.getItem("pulse-open-streak");
      const parsed = raw ? (JSON.parse(raw) as { lastDate: string; count: number }) : null;

      if (!parsed) {
        localStorage.setItem("pulse-open-streak", JSON.stringify({ lastDate: today, count: 1 }));
        setStreak(1);
        return;
      }
      if (parsed.lastDate === today) {
        setStreak(parsed.count);
        return;
      }
      const yesterday = new Date(Date.now() - 86_400_000).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      const nextCount = parsed.lastDate === yesterday ? parsed.count + 1 : 1;
      localStorage.setItem("pulse-open-streak", JSON.stringify({ lastDate: today, count: nextCount }));
      setStreak(nextCount);
    } catch {
      setStreak(1);
    }
  }, []);

  return streak;
}

export interface QuickStatsProps {
  attendancePct: number | null;
  pendingAssignments: number;
}

/** 3-across at-a-glance stats row on the dashboard. */
export function QuickStats({ attendancePct, pendingAssignments }: QuickStatsProps) {
  const streak = useOpenStreak();

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-5">
      <StatCard
        emoji="📚"
        label="Attendance"
        value={attendancePct === null ? "—" : `${Math.round(attendancePct)}%`}
        warning={attendancePct !== null && attendancePct < 75 ? "Teri attendance gayi bhai" : undefined}
      />
      <StatCard
        emoji="📋"
        label="Pending"
        value={String(pendingAssignments)}
      />
      <StatCard emoji="🔥" label="Streak" value={`${streak} ${streak === 1 ? "day" : "days"}`} />
    </div>
  );
}
