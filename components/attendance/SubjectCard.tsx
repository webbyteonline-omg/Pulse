"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useMarkAttendance } from "@/hooks/useAttendance";
import { attendanceHealth, attendancePercent, bunkStats } from "@/lib/utils";
import type { Subject } from "@/lib/supabase/types";

const HEALTH_COLORS = { good: "#10B981", warning: "#FFB347", danger: "#FF5C5C" } as const;

export function SubjectCard({ subject, index = 0 }: { subject: Subject; index?: number }) {
  const router = useRouter();
  const mark = useMarkAttendance();
  const pct = attendancePercent(subject.attended_classes, subject.total_classes);
  const health = attendanceHealth(
    subject.attended_classes,
    subject.total_classes,
    subject.required_percentage
  );
  const color = HEALTH_COLORS[health];
  const hasClasses = subject.total_classes > 0;
  const { canMiss } = bunkStats(subject.attended_classes, subject.total_classes, subject.required_percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.1 }}
      layout
    >
      <Card
        className="p-3 border-l-4"
        style={{ borderLeftColor: subject.color }}
      >
        <button
          className="w-full text-left"
          onClick={() => router.push(`/attendance/${subject.id}`)}
        >
          <div className="flex items-center gap-2">
            <h3 className="flex-1 min-w-0 text-[14px] font-semibold truncate">{subject.name}</h3>
            <span className="text-xs text-ink-dim tabular-nums">
              {subject.attended_classes}/{subject.total_classes}
            </span>
            <span className="text-sm font-bold tabular-nums w-12 text-right" style={{ color }}>
              {hasClasses ? `${pct}%` : "—"}
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hasClasses ? Math.min(100, pct) : 0}%` }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        </button>

        <div className="mt-2.5 grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={mark.isPending}
            onClick={() => mark.mutate({ subject, status: "present" })}
            className="flex items-center justify-center gap-1.5 h-8 rounded-btn bg-success-dim text-success text-xs font-bold border border-success/25 hover:bg-success/25 transition-colors disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> Aaya hoon
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={mark.isPending}
            onClick={() => mark.mutate({ subject, status: "absent" })}
            className="flex items-center justify-center gap-1.5 h-8 rounded-btn bg-danger-dim text-danger text-xs font-bold border border-danger/25 hover:bg-danger/25 transition-colors disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> Gaya nahi
          </motion.button>
        </div>
        {hasClasses && (
          <p className="mt-1.5 text-center text-[10px] text-ink-faint">
            {canMiss > 0 ? `${canMiss} safe bunks left` : "0 safe bunks left — attend next class"}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
