"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CountdownCard } from "@/components/academic/CountdownCard";
import { QuizCard } from "@/components/academic/QuizCard";
import { QuizFormModal } from "@/components/academic/QuizFormModal";
import { useQuizzes } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";
import { daysUntil } from "@/lib/utils";

type Filter = "upcoming" | "completed";
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

/** Quizzes tab — isolated so its data only loads while this tab is active. */
export function QuizzesSection() {
  const quizzesQuery = useQuizzes();
  const subjectsQuery = useSubjects();
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [showAdd, setShowAdd] = useState(false);

  const quizzes = useMemo(() => quizzesQuery.data ?? [], [quizzesQuery.data]);
  const subjects = subjectsQuery.data ?? [];
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const nextQuiz = quizzes
    .filter((q) => q.status === "upcoming" && daysUntil(q.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const filtered = useMemo(() => {
    if (filter === "upcoming") {
      return quizzes.filter((q) => daysUntil(q.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
    }
    return quizzes.filter((q) => daysUntil(q.date) < 0).sort((a, b) => b.date.localeCompare(a.date));
  }, [quizzes, filter]);

  if (quizzesQuery.isLoading) return <RowSkeleton rows={4} />;

  return (
    <>
      {nextQuiz && (
        <div className="mb-4">
          <CountdownCard
            event={{
              id: nextQuiz.id,
              user_id: nextQuiz.user_id,
              title: nextQuiz.title,
              event_type: "quiz",
              date: nextQuiz.date,
              description: nextQuiz.syllabus,
              subject_id: nextQuiz.subject_id,
              notified_3day: true,
              notified_1day: true,
              created_at: nextQuiz.created_at,
            }}
            tone="quiz"
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors"
              style={{
                backgroundColor: filter === f.id ? "#6C63FF" : "rgba(255,255,255,0.06)",
                color: filter === f.id ? "#FFFFFF" : "#8888A8",
                border: filter === f.id ? "1px solid transparent" : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
        {quizzes.length > 0 && (
          <button
            onClick={() => setShowAdd(true)}
            aria-label="Add quiz"
            className="shrink-0 h-9 w-9 grid place-items-center rounded-full"
            style={{
              backgroundColor: "rgba(108,99,255,0.12)",
              border: "1px solid rgba(108,99,255,0.2)",
              color: "#9B97FF",
            }}
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration="events"
          title={quizzes.length === 0 ? "No quizzes" : "Nothing here"}
          description={
            quizzes.length === 0
              ? "Add upcoming quizzes and track your scores once they're done."
              : "No quizzes match this filter."
          }
          actionLabel={quizzes.length === 0 ? "Add Quiz" : undefined}
          onAction={quizzes.length === 0 ? () => setShowAdd(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((q, i) => (
              <QuizCard
                key={q.id}
                quiz={q}
                subject={q.subject_id ? subjectById.get(q.subject_id) : undefined}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <QuizFormModal open={showAdd} onClose={() => setShowAdd(false)} subjects={subjects} />
    </>
  );
}
