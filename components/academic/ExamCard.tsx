"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useDeleteExam, useUpdateExamStatus } from "@/hooks/useAcademicWork";
import { daysLabel, daysUntil, formatDate } from "@/lib/utils";
import type { Exam, ExamStatus, ExamType, Subject } from "@/lib/supabase/types";

const STATUS_META: Record<ExamStatus, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "#C56CFF" },
  completed: { label: "Completed", color: "#43D98C" },
  missed: { label: "Missed", color: "#FF5C5C" },
};

const EXAM_TYPE_LABEL: Record<ExamType, string> = {
  midterm: "Midterm",
  final: "Final",
  unit_test: "Unit Test",
  practical: "Practical",
  other: "Exam",
};

export function ExamCard({
  exam,
  subject,
  index = 0,
}: {
  exam: Exam;
  subject?: Subject;
  index?: number;
}) {
  const updateStatus = useUpdateExamStatus();
  const deleteExam = useDeleteExam();
  const days = daysUntil(exam.date);
  const autoMissed = exam.status === "upcoming" && days < 0;
  const meta = autoMissed ? STATUS_META.missed : STATUS_META[exam.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: Math.min(0.3, 0.03 * index) }}
      className="clay rounded-card p-4"
      style={{ borderLeftColor: meta.color, borderLeftWidth: 3 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color={meta.color}>{meta.label}</Badge>
            <Badge color="#8888A0">{EXAM_TYPE_LABEL[exam.exam_type]}</Badge>
            {subject && <Badge color={subject.color}>{subject.name}</Badge>}
          </div>
          <p className="mt-1.5 font-semibold leading-snug">{exam.title}</p>
          <p className="mt-0.5 text-xs text-ink-dim">
            {formatDate(exam.date, { withYear: true })} · {daysLabel(days)}
            {exam.syllabus ? ` · ${exam.syllabus}` : ""}
          </p>
          {exam.status === "completed" && exam.score !== null && (
            <p className="mt-1 text-xs font-semibold" style={{ color: meta.color }}>
              Score: {exam.score}
              {exam.max_score ? ` / ${exam.max_score}` : ""}
            </p>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => deleteExam.mutate(exam.id)}
          aria-label={`Delete ${exam.title}`}
          className="p-2 rounded-input text-ink-faint hover:text-danger hover:bg-danger-dim transition-colors shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>

      {exam.status === "upcoming" && !autoMissed && (
        <button
          onClick={() => updateStatus.mutate({ id: exam.id, status: "completed" })}
          className="mt-3 w-full h-9 rounded-input text-xs font-bold border border-line text-ink-dim hover:text-ink hover:border-primary/50 transition-colors"
        >
          Mark as Completed
        </button>
      )}
    </motion.div>
  );
}
