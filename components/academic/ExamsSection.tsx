"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { CountdownCard } from "@/components/academic/CountdownCard";
import { ExamCard } from "@/components/academic/ExamCard";
import { ExamFormModal } from "@/components/academic/ExamFormModal";
import { useExams } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";
import { daysUntil } from "@/lib/utils";

/** Exams tab — isolated so its data only loads while this tab is active. */
export function ExamsSection() {
  const examsQuery = useExams();
  const subjectsQuery = useSubjects();
  const [showAdd, setShowAdd] = useState(false);

  const exams = useMemo(() => examsQuery.data ?? [], [examsQuery.data]);
  const subjects = subjectsQuery.data ?? [];
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const nextExam = exams
    .filter((e) => e.status === "upcoming" && daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const sorted = useMemo(
    () =>
      [...exams].sort((a, b) => {
        const da = daysUntil(a.date);
        const db = daysUntil(b.date);
        // Upcoming first (soonest first), then past (most recent first)
        if (da >= 0 && db >= 0) return da - db;
        if (da >= 0) return -1;
        if (db >= 0) return 1;
        return db - da;
      }),
    [exams]
  );

  if (examsQuery.isLoading) return <RowSkeleton rows={4} />;

  return (
    <>
      {nextExam && (
        <div className="mb-4">
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

      {sorted.length === 0 ? (
        <EmptyState
          illustration="events"
          title="No exams"
          description="Add midterms, finals, and unit tests to track dates and scores."
          actionLabel="Add Exam"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {sorted.map((e, i) => (
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
    </>
  );
}
