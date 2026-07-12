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
import { ExamCard } from "@/components/academic/ExamCard";
import { ExamFormModal } from "@/components/academic/ExamFormModal";
import { useExams } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";
import { daysUntil } from "@/lib/utils";

type Tab = "upcoming" | "past" | "all";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
];

export default function ExamsPage() {
  const examsQuery = useExams();
  const subjectsQuery = useSubjects();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [showAdd, setShowAdd] = useState(false);

  const exams = useMemo(() => examsQuery.data ?? [], [examsQuery.data]);
  const subjects = subjectsQuery.data ?? [];
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const nextExam = exams
    .filter((e) => e.status === "upcoming" && daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const filtered = useMemo(() => {
    let list = [...exams];
    if (tab === "upcoming") {
      list = list.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
    } else if (tab === "past") {
      list = list.filter((e) => daysUntil(e.date) < 0).sort((a, b) => b.date.localeCompare(a.date));
    } else {
      list.sort((a, b) => b.date.localeCompare(a.date));
    }
    return list;
  }, [exams, tab]);

  return (
    <div>
      <Header
        title="Exams"
        subtitle="Midterms, finals & unit tests"
        action={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Exam
          </Button>
        }
      />
      <SubTabs tabs={ACADEMIC_TABS} layoutId="academic-tabs" />

      {nextExam && (
        <div className="mb-6">
          <CountdownCard
            event={{
              id: nextExam.id,
              user_id: nextExam.user_id,
              title: nextExam.title,
              event_type: "exam",
              date: nextExam.date,
              description: nextExam.syllabus,
              subject_id: nextExam.subject_id,
              notified_3day: true,
              notified_1day: true,
              created_at: nextExam.created_at,
            }}
            tone="exam"
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

      {examsQuery.isLoading ? (
        <RowSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="events"
          title={exams.length === 0 ? "No exams yet" : "Nothing here"}
          description={
            exams.length === 0
              ? "Add midterms, finals, and unit tests to track dates and scores."
              : "No exams match this filter."
          }
          actionLabel={exams.length === 0 ? "Add an exam" : undefined}
          onAction={exams.length === 0 ? () => setShowAdd(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((e, i) => (
              <ExamCard
                key={e.id}
                exam={e}
                subject={e.subject_id ? subjectById.get(e.subject_id) : undefined}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <FAB label="Add exam" onClick={() => setShowAdd(true)} />
      <ExamFormModal open={showAdd} onClose={() => setShowAdd(false)} subjects={subjects} />
    </div>
  );
}
