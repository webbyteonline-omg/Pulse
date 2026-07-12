"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useDeleteQuiz, useUpdateQuizStatus } from "@/hooks/useAcademicWork";
import { daysLabel, daysUntil, formatDate } from "@/lib/utils";
import type { Quiz, QuizStatus, Subject } from "@/lib/supabase/types";

const STATUS_META: Record<QuizStatus, { label: string; color: string }> = {
  upcoming: { label: "Upcoming", color: "#5AB0FF" },
  completed: { label: "Completed", color: "#43D98C" },
  missed: { label: "Missed", color: "#FF5C5C" },
};

export function QuizCard({
  quiz,
  subject,
  index = 0,
}: {
  quiz: Quiz;
  subject?: Subject;
  index?: number;
}) {
  const updateStatus = useUpdateQuizStatus();
  const deleteQuiz = useDeleteQuiz();
  const days = daysUntil(quiz.date);
  const autoMissed = quiz.status === "upcoming" && days < 0;
  const meta = autoMissed ? STATUS_META.missed : STATUS_META[quiz.status];

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
          <Badge color={meta.color}>{meta.label}</Badge>
          {subject && <Badge color={subject.color}>{subject.name}</Badge>}
        </div>
        <p className="mt-1.5 font-semibold leading-snug">{quiz.title}</p>
        <p className="mt-0.5 text-xs text-ink-dim">
          {formatDate(quiz.date, { withYear: true })}
          {quiz.syllabus ? ` · ${quiz.syllabus}` : ""}
        </p>
        {quiz.status === "completed" && quiz.score !== null && (
          <p className="mt-1 text-xs font-semibold" style={{ color: meta.color }}>
            Score: {quiz.score}
            {quiz.max_score ? ` / ${quiz.max_score}` : ""}
          </p>
        )}
      </div>

      {days >= 0 && quiz.status === "upcoming" ? (
        <div className="text-center shrink-0 w-14">
          <p className="text-2xl font-black tabular-nums leading-none" style={{ color: meta.color }}>
            {days}
          </p>
          <p className="text-[10px] text-ink-dim font-semibold uppercase mt-0.5">
            {days === 0 ? "today" : days === 1 ? "day" : "days"}
          </p>
        </div>
      ) : (
        <span className="text-[11px] text-ink-faint shrink-0">{daysLabel(days)}</span>
      )}

      {quiz.status === "upcoming" && !autoMissed && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => updateStatus.mutate({ id: quiz.id, status: "completed" })}
          aria-label={`Mark ${quiz.title} completed`}
          className="px-2.5 h-8 rounded-input text-[11px] font-bold border border-line text-ink-dim hover:text-ink hover:border-primary/50 transition-colors shrink-0"
        >
          Done
        </motion.button>
      )}

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => deleteQuiz.mutate(quiz.id)}
        aria-label={`Delete ${quiz.title}`}
        className="p-2 rounded-input text-ink-faint hover:text-danger hover:bg-danger-dim transition-colors shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}
