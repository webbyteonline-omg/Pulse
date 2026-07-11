"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EVENT_TYPE_META, daysLabel, daysUntil, formatDate } from "@/lib/utils";
import type { AcademicEvent } from "@/lib/supabase/types";

/** Horizontal-scroll cards for the next 7 days. */
export function UpcomingEvents({ events }: { events: AcademicEvent[] }) {
  const upcoming = events
    .filter((e) => {
      const d = daysUntil(e.date);
      return d >= 0 && d <= 7;
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  if (upcoming.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">Next 7 days</h2>
        <Link href="/academic" className="text-xs font-semibold text-primary hover:underline">
          View all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 snap-x">
        {upcoming.map((event, i) => {
          const meta = EVENT_TYPE_META[event.event_type ?? "other"];
          const days = daysUntil(event.date);
          return (
            <Link key={event.id} href="/academic" className="snap-start shrink-0">
              <motion.div
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i }}
                whileTap={{ scale: 0.96 }}
                className="w-40 rounded-card border p-3.5 bg-card"
                style={{ borderColor: `${meta.color}44` }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold leading-snug line-clamp-2">{event.title}</p>
                <p className="mt-1.5 text-[11px] text-ink-dim">{formatDate(event.date)}</p>
                <p className="mt-0.5 text-xs font-bold" style={{ color: meta.color }}>
                  {daysLabel(days)}
                </p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
