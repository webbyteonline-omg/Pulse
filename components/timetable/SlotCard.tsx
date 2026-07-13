"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import type { Subject, TimetableSlot } from "@/lib/supabase/types";

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hour = h ?? 0;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}${m ? `:${String(m).padStart(2, "0")}` : ""} ${suffix}`;
}

export function SlotCard({
  slot,
  subject,
  onDelete,
}: {
  slot: TimetableSlot;
  subject: Subject | undefined;
  onDelete?: (id: string) => void;
}) {
  const color = subject?.color ?? "#6C63FF";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-input border px-2 py-1.5 text-left group relative"
      style={{ backgroundColor: `${color}1a`, borderColor: `${color}55` }}
    >
      <p className="text-[11px] font-bold leading-tight truncate" style={{ color }}>
        {subject?.name ?? "Class"}
      </p>
      <p className="text-[10px] text-ink-dim leading-tight">
        {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
        {slot.room ? ` · ${slot.room}` : ""}
      </p>
      {onDelete && (
        <button
          onClick={() => onDelete(slot.id)}
          aria-label="Remove class"
          className="absolute -top-1.5 -right-1.5 h-6 w-6 grid place-items-center rounded-full clay text-ink-faint hover:text-danger opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
}
