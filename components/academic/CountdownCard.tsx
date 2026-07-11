"use client";

import { motion } from "framer-motion";
import { daysUntil, formatDate } from "@/lib/utils";
import type { AcademicEvent } from "@/lib/supabase/types";

/** Dramatic pinned countdown — next exam (red) / next holiday (green). */
export function CountdownCard({
  event,
  tone,
}: {
  event: AcademicEvent;
  tone: "exam" | "holiday";
}) {
  const days = daysUntil(event.date);
  const color = tone === "exam" ? "#FF5C5C" : "#43D98C";
  const label = tone === "exam" ? "Next exam" : "Next holiday";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-card border p-5"
      style={{
        borderColor: `${color}40`,
        background: `linear-gradient(135deg, #1A1A24 55%, ${color}14 100%)`,
      }}
    >
      <div
        aria-hidden
        className="absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-25"
        style={{ backgroundColor: color }}
      />
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>
        {label}
      </p>
      <p className="mt-1.5 text-base font-extrabold uppercase tracking-wide leading-snug line-clamp-2">
        {event.title}
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <motion.span
          key={days}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.15 }}
          className="text-5xl font-black tabular-nums tracking-tighter"
          style={{ color }}
        >
          {days}
        </motion.span>
        <span className="text-sm font-bold text-ink-dim uppercase">
          {days === 1 ? "day" : "days"}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-dim">{formatDate(event.date, { withYear: true })}</p>
    </motion.div>
  );
}
