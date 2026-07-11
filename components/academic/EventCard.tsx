"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EVENT_TYPE_META, daysLabel, daysUntil, formatDate } from "@/lib/utils";
import type { AcademicEvent, Subject } from "@/lib/supabase/types";

export function EventCard({
  event,
  subject,
  onDelete,
  index = 0,
}: {
  event: AcademicEvent;
  subject?: Subject;
  onDelete: (id: string) => void;
  index?: number;
}) {
  const meta = EVENT_TYPE_META[event.event_type ?? "other"];
  const days = daysUntil(event.date);
  const upcoming = days >= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: Math.min(0.3, 0.03 * index) }}
      className="flex items-center gap-3.5 bg-card border border-line rounded-card p-4"
      style={{ borderLeftColor: meta.color, borderLeftWidth: 3 }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge color={meta.color}>
            {meta.emoji} {meta.label}
          </Badge>
          {subject && <Badge color={subject.color}>{subject.name}</Badge>}
        </div>
        <p className="mt-1.5 font-semibold leading-snug">{event.title}</p>
        <p className="mt-0.5 text-xs text-ink-dim">
          {formatDate(event.date, { withYear: true })}
          {event.description ? ` · ${event.description}` : ""}
        </p>
      </div>

      {upcoming && (
        <div className="text-center shrink-0 w-14">
          <p className="text-2xl font-black tabular-nums leading-none" style={{ color: meta.color }}>
            {days}
          </p>
          <p className="text-[10px] text-ink-dim font-semibold uppercase mt-0.5">
            {days === 0 ? "today" : days === 1 ? "day" : "days"}
          </p>
        </div>
      )}
      {!upcoming && (
        <span className="text-[11px] text-ink-faint shrink-0">{daysLabel(days)}</span>
      )}

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onDelete(event.id)}
        aria-label={`Delete ${event.title}`}
        className="p-2 rounded-input text-ink-faint hover:text-danger hover:bg-danger-dim transition-colors shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
