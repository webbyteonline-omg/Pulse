"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { formatTime } from "@/components/timetable/SlotCard";
import { useTodayClasses } from "@/hooks/useTimetable";
import { useSubjects } from "@/hooks/useAttendance";
import { nowIST } from "@/lib/utils";

/** "Today's classes" strip pulled from the timetable. */
export function TodayClasses() {
  const { data: classes } = useTodayClasses();
  const { data: subjects } = useSubjects();
  const subjectById = useMemo(
    () => new Map((subjects ?? []).map((s) => [s.id, s])),
    [subjects]
  );

  if (!classes || classes.length === 0) return null;

  const now = nowIST();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">
          Upcoming Classes
        </h2>
        <Link href="/timetable" className="text-xs font-semibold text-primary hover:underline">
          See All
        </Link>
      </div>
      <Card className="divide-y divide-line/60">
        {classes.map((slot) => {
          const subject = subjectById.get(slot.subject_id);
          const [sh, sm] = slot.start_time.split(":").map(Number);
          const [eh, em] = slot.end_time.split(":").map(Number);
          const startMin = (sh ?? 0) * 60 + (sm ?? 0);
          const endMin = (eh ?? 0) * 60 + (em ?? 0);
          const state =
            nowMinutes >= endMin ? "done" : nowMinutes >= startMin ? "live" : "upcoming";
          const minsUntil = startMin - nowMinutes;
          const untilLabel =
            minsUntil >= 60
              ? `in ${Math.floor(minsUntil / 60)}h ${minsUntil % 60 > 0 ? `${minsUntil % 60}m` : ""}`.trim()
              : `in ${minsUntil}m`;
          return (
            <Link
              key={slot.id}
              href={subject ? `/attendance/${subject.id}` : "/timetable"}
              className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors first:rounded-t-card last:rounded-b-card"
            >
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: subject?.color ?? "#6C63FF" }}
              />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${state === "done" ? "text-ink-faint line-through" : ""}`}>
                  {subject?.name ?? "Class"}
                </p>
                <p className="text-[11px] text-ink-dim">
                  {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                  {slot.room ? ` · ${slot.room}` : ""}
                </p>
              </div>
              {state === "live" && (
                <span className="text-[10px] font-bold text-success bg-success-dim px-2 py-0.5 rounded-full">
                  NOW
                </span>
              )}
              {state === "upcoming" && (
                <span className="text-[10px] font-bold text-primary bg-primary-dim px-2 py-1 rounded-full shrink-0">
                  {untilLabel}
                </span>
              )}
              {state === "done" && subject && (
                <span className="text-[10px] font-bold text-primary">mark →</span>
              )}
            </Link>
          );
        })}
      </Card>
    </section>
  );
}
