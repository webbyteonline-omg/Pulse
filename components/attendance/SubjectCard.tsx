"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useMarkAttendance } from "@/hooks/useAttendance";
import { attendanceHealth, attendancePercent } from "@/lib/utils";
import type { Subject } from "@/lib/supabase/types";

const HEALTH_COLORS = { good: "#43D98C", warning: "#FFB347", danger: "#FF5C5C" } as const;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.3 }}
      layout
    >
      <Card className="p-4">
        <button
          className="w-full text-left"
          onClick={() => router.push(`/attendance/${subject.id}`)}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: subject.color }}
            />
            <h3 className="flex-1 min-w-0 font-semibold truncate">{subject.name}</h3>
            <span className="text-sm text-ink-dim tabular-nums">
              {subject.attended_classes}/{subject.total_classes}
            </span>
            <span className="text-base font-bold tabular-nums w-14 text-right" style={{ color }}>
              {hasClasses ? `${pct}%` : "—"}
            </span>
          </div>
          <div className="mt-3 h-2 rounded-full bg-line overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${hasClasses ? Math.min(100, pct) : 0}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={mark.isPending}
            onClick={() => mark.mutate({ subject, status: "present" })}
            className="flex items-center justify-center gap-1.5 h-9 rounded-btn bg-success-dim text-success text-xs font-bold border border-success/25 hover:bg-success/25 transition-colors disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" /> Present
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={mark.isPending}
            onClick={() => mark.mutate({ subject, status: "absent" })}
            className="flex items-center justify-center gap-1.5 h-9 rounded-btn bg-danger-dim text-danger text-xs font-bold border border-danger/25 hover:bg-danger/25 transition-colors disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" /> Absent
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
}
