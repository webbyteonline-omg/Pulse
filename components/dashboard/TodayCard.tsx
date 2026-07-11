"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";

export interface TodayCardProps {
  emoji: string;
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "success" | "warning" | "danger";
  index?: number;
}

const TONES = {
  default: "text-ink",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

/** One tile of the 2×2 "Today at a glance" grid. */
export function TodayCard({ emoji, label, value, sub, tone = "default", index = 0 }: TodayCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 * index, duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card gradient className="p-4 h-full">
        <div className="flex items-center gap-1.5 text-xs text-ink-dim font-medium">
          <span aria-hidden>{emoji}</span>
          <span>{label}</span>
        </div>
        <p className={`mt-2 text-lg font-bold leading-tight tracking-tight ${TONES[tone]}`}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-[11px] text-ink-dim truncate">{sub}</p>}
      </Card>
    </motion.div>
  );
}
