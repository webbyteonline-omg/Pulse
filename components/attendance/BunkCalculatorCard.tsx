"use client";

import { Card } from "@/components/ui/Card";
import { attendancePercent, bunkStats } from "@/lib/utils";
import type { Subject } from "@/lib/supabase/types";

/** "You can bunk X more times" — safe (green) or danger (red) card. */
export function BunkCalculatorCard({ subjects }: { subjects: Subject[] }) {
  const attended = subjects.reduce((s, x) => s + x.attended_classes, 0);
  const total = subjects.reduce((s, x) => s + x.total_classes, 0);
  if (total === 0) return null;

  const required = Math.round(
    subjects.reduce((s, x) => s + x.required_percentage, 0) / Math.max(1, subjects.length)
  );
  const pct = attendancePercent(attended, total);
  const { canMiss, toReach } = bunkStats(attended, total, required);
  const safe = pct >= required;

  return (
    <Card
      className={`mb-4 p-4 ${safe ? "bg-success-dim" : "bg-danger-dim"}`}
    >
      {safe ? (
        <>
          <p className="text-sm font-black text-success">
            You can bunk {canMiss} more {canMiss === 1 ? "time" : "times"} 😎
          </p>
          <p className="mt-1 text-xs text-ink-dim">and still stay above {required}% — chill maar</p>
        </>
      ) : (
        <>
          <p className="text-sm font-black text-danger">Teri attendance gayi bhai 💀</p>
          <p className="mt-1 text-xs text-ink-dim">
            Attend the next {toReach(required)} classes straight to get back above {required}%
          </p>
        </>
      )}
    </Card>
  );
}
