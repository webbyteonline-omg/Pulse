"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { SlotCard } from "./SlotCard";
import { nowIST } from "@/lib/utils";
import type { Subject, TimetableSlot } from "@/lib/supabase/types";

const DAYS = [
  { dow: 1, label: "Mon" },
  { dow: 2, label: "Tue" },
  { dow: 3, label: "Wed" },
  { dow: 4, label: "Thu" },
  { dow: 5, label: "Fri" },
  { dow: 6, label: "Sat" },
];

/**
 * Weekly timetable, Mon–Sat. On mobile it's a day-switcher (375px-friendly);
 * on desktop all six columns show side by side. Today is highlighted.
 */
export function WeekGrid({
  slots,
  subjects,
  onAdd,
  onDelete,
}: {
  slots: TimetableSlot[];
  subjects: Subject[];
  onAdd: (dow: number) => void;
  onDelete: (id: string) => void;
}) {
  const todayDow = nowIST().getDay();
  const [mobileDay, setMobileDay] = useState(todayDow >= 1 && todayDow <= 6 ? todayDow : 1);
  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);

  const byDay = useMemo(() => {
    const map = new Map<number, TimetableSlot[]>();
    for (const day of DAYS) map.set(day.dow, []);
    for (const slot of slots) {
      map.get(slot.day_of_week)?.push(slot);
    }
    for (const list of map.values()) list.sort((a, b) => a.start_time.localeCompare(b.start_time));
    return map;
  }, [slots]);

  const renderColumn = (dow: number, label: string) => {
    const daySlots = byDay.get(dow) ?? [];
    const isToday = dow === todayDow;
    return (
      <div
        key={dow}
        className={`flex-1 min-w-0 rounded-card border p-2 ${
          isToday ? "border-primary/50 bg-primary/[0.04]" : "border-line bg-card"
        }`}
      >
        <p
          className={`text-[11px] font-bold text-center mb-2 ${
            isToday ? "text-primary" : "text-ink-dim"
          }`}
        >
          {label}
          {isToday && " · today"}
        </p>
        <div className="space-y-1.5">
          {daySlots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              subject={subjectById.get(slot.subject_id)}
              onDelete={onDelete}
            />
          ))}
          <button
            onClick={() => onAdd(dow)}
            aria-label={`Add class on ${label}`}
            className="w-full min-h-[44px] rounded-input border border-dashed border-line text-ink-faint hover:text-primary hover:border-primary/50 grid place-items-center transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Mobile: day switcher */}
      <div className="md:hidden">
        <div className="flex gap-1 mb-3 bg-card border border-line rounded-btn p-1">
          {DAYS.map((day) => (
            <button
              key={day.dow}
              onClick={() => setMobileDay(day.dow)}
              className={`flex-1 h-10 rounded-input text-[11px] font-bold transition-colors ${
                mobileDay === day.dow
                  ? "bg-primary text-white"
                  : day.dow === todayDow
                    ? "text-primary"
                    : "text-ink-dim"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        {renderColumn(mobileDay, DAYS.find((d) => d.dow === mobileDay)?.label ?? "")}
      </div>

      {/* Desktop: full week */}
      <div className="hidden md:flex gap-2">
        {DAYS.map((day) => renderColumn(day.dow, day.label))}
      </div>
    </div>
  );
}
