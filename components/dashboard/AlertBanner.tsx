"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useMemo } from "react";
import { attendancePercent, daysUntil, todayIST } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";
import type { AcademicEvent, Subject } from "@/lib/supabase/types";

export interface Alert {
  id: string;
  severity: "danger" | "warning" | "success";
  emoji: string;
  text: string;
}

const SEVERITY_STYLES: Record<Alert["severity"], string> = {
  danger: "bg-danger-dim border-danger/30 text-danger",
  warning: "bg-warning-dim border-warning/30 text-warning",
  success: "bg-success-dim border-success/30 text-success",
};

/** Build prioritized alerts: exams tomorrow > low attendance > holiday tomorrow. */
export function buildAlerts(events: AcademicEvent[], subjects: Subject[]): Alert[] {
  const alerts: Alert[] = [];

  for (const event of events) {
    if (daysUntil(event.date) === 1 && (event.event_type === "exam" || event.event_type === "quiz")) {
      alerts.push({
        id: `exam-${event.id}`,
        severity: "danger",
        emoji: "🔴",
        text: `${event.event_type === "exam" ? "Exam" : "Quiz"} tomorrow — ${event.title}`,
      });
    }
  }

  for (const subject of subjects) {
    if (subject.total_classes === 0) continue;
    const pct = attendancePercent(subject.attended_classes, subject.total_classes);
    if (pct < subject.required_percentage) {
      alerts.push({
        id: `att-${subject.id}`,
        severity: "warning",
        emoji: "🟡",
        text: `${subject.name} attendance at ${pct}% — attend next class`,
      });
    }
  }

  for (const event of events) {
    if (daysUntil(event.date) === 1 && event.event_type === "holiday") {
      alerts.push({
        id: `hol-${event.id}`,
        severity: "success",
        emoji: "🟢",
        text: `Holiday tomorrow — ${event.title}`,
      });
    }
  }

  return alerts;
}

export function AlertBanners({ events, subjects }: { events: AcademicEvent[]; subjects: Subject[] }) {
  const dismissed = useSettingsStore((s) => s.dismissedAlerts);
  const dismissAlert = useSettingsStore((s) => s.dismissAlert);
  const today = todayIST();

  const alerts = useMemo(
    () =>
      buildAlerts(events, subjects)
        .filter((a) => !dismissed.includes(`${today}:${a.id}`))
        .slice(0, 3),
    [events, subjects, dismissed, today]
  );

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-5">
      <AnimatePresence initial={false}>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 60, transition: { duration: 0.2 } }}
            className={`flex items-center gap-2.5 border rounded-btn px-3.5 py-2.5 text-sm font-medium ${SEVERITY_STYLES[alert.severity]}`}
            role="status"
          >
            <span aria-hidden>{alert.emoji}</span>
            <span className="flex-1 min-w-0">{alert.text}</span>
            <button
              onClick={() => dismissAlert(`${today}:${alert.id}`)}
              aria-label="Dismiss"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
