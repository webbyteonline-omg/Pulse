"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ACADEMIC_TABS, SubTabs } from "@/components/layout/SubTabs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { CountdownCard } from "@/components/academic/CountdownCard";
import { QuizCard } from "@/components/academic/QuizCard";
import { QuizFormModal } from "@/components/academic/QuizFormModal";
import { useQuizzes } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";
import { daysUntil } from "@/lib/utils";

type Tab = "upcoming" | "past" | "all";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
];

export default function QuizzesPage() {
  const quizzesQuery = useQuizzes();
  const subjectsQuery = useSubjects();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [showAdd, setShowAdd] = useState(false);

  const quizzes = useMemo(() => quizzesQuery.data ?? [], [quizzesQuery.data]);
  const subjects = subjectsQuery.data ?? [];
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const nextQuiz = quizzes
    .filter((q) => q.status === "upcoming" && daysUntil(q.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const filtered = useMemo(() => {
    let list = [...quizzes];
    if (tab === "upcoming") {
      list = list.filter((q) => daysUntil(q.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
    } else if (tab === "past") {
      list = list.filter((q) => daysUntil(q.date) < 0).sort((a, b) => b.date.localeCompare(a.date));
    } else {
      list.sort((a, b) => b.date.localeCompare(a.date));
    }
    return list;
  }, [quizzes, tab]);

  return (
    <div>
      <Header
        title="Upcoming Quiz"
        subtitle="Quizzes & unit tests"
        action={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Quiz
          </Button>
        }
      />
      <SubTabs tabs={ACADEMIC_TABS} layoutId="academic-tabs" />

      {nextQuiz && (
        <div className="mb-6">
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

      <div className="flex items-center gap-1 bg-card border border-line rounded-btn p-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-8 rounded-input text-xs font-bold transition-colors ${
              tab === t.id ? "bg-primary text-white" : "text-ink-dim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {quizzesQuery.isLoading ? (
        <RowSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="events"
          title={quizzes.length === 0 ? "No quizzes yet" : "Nothing here"}
          description={
            quizzes.length === 0
              ? "Add upcoming quizzes and track your scores once they're done."
              : "No quizzes match this filter."
          }
          actionLabel={quizzes.length === 0 ? "Add a quiz" : undefined}
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

      <FAB label="Add quiz" onClick={() => setShowAdd(true)} />
      <QuizFormModal open={showAdd} onClose={() => setShowAdd(false)} subjects={subjects} />
    </div>
  );
}
