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
import { AssignmentCard } from "@/components/academic/AssignmentCard";
import { AssignmentFormModal } from "@/components/academic/AssignmentFormModal";
import { useAssignments } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";
import { daysUntil } from "@/lib/utils";

type Tab = "pending" | "done" | "all";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "done", label: "Done" },
  { id: "all", label: "All" },
];

export default function AssignmentsPage() {
  const assignmentsQuery = useAssignments();
  const subjectsQuery = useSubjects();
  const [tab, setTab] = useState<Tab>("pending");
  const [showAdd, setShowAdd] = useState(false);

  const assignments = useMemo(() => assignmentsQuery.data ?? [], [assignmentsQuery.data]);
  const subjects = subjectsQuery.data ?? [];
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const filtered = useMemo(() => {
    let list = [...assignments];
    if (tab === "pending") {
      list = list.filter((a) => a.status === "pending" || a.status === "submitted");
      list.sort((a, b) => a.due_date.localeCompare(b.due_date));
    } else if (tab === "done") {
      list = list.filter((a) => a.status === "graded");
      list.sort((a, b) => b.due_date.localeCompare(a.due_date));
    } else {
      list.sort((a, b) => a.due_date.localeCompare(b.due_date));
    }
    return list;
  }, [assignments, tab]);

  const pendingCount = assignments.filter(
    (a) => a.status === "pending" || (a.status === "submitted" && daysUntil(a.due_date) >= -1)
  ).length;

  return (
    <div>
      <Header
        title="Assignments"
        subtitle={pendingCount > 0 ? `${pendingCount} pending` : "All caught up"}
        action={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Assignment
          </Button>
        }
      />
      <SubTabs tabs={ACADEMIC_TABS} layoutId="academic-tabs" />

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

      {assignmentsQuery.isLoading ? (
        <RowSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="events"
          title={assignments.length === 0 ? "No assignments yet" : "Nothing here"}
          description={
            assignments.length === 0
              ? "Track due dates and submission status for every assignment."
              : "Nothing matches this filter."
          }
          actionLabel={assignments.length === 0 ? "Add an assignment" : undefined}
          onAction={assignments.length === 0 ? () => setShowAdd(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((a, i) => (
              <AssignmentCard
                key={a.id}
                assignment={a}
                subject={a.subject_id ? subjectById.get(a.subject_id) : undefined}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <FAB label="Add assignment" onClick={() => setShowAdd(true)} />
      <AssignmentFormModal open={showAdd} onClose={() => setShowAdd(false)} subjects={subjects} />
    </div>
  );
}
