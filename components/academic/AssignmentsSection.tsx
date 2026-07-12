"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { AssignmentCard } from "@/components/academic/AssignmentCard";
import { AssignmentFormModal } from "@/components/academic/AssignmentFormModal";
import { useAssignments } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";

type Filter = "all" | "pending" | "submitted" | "graded";
const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "submitted", label: "Submitted" },
  { id: "graded", label: "Graded" },
];

/** Assignments tab — isolated so its data only loads while this tab is active. */
export function AssignmentsSection() {
  const assignmentsQuery = useAssignments();
  const subjectsQuery = useSubjects();
  const [filter, setFilter] = useState<Filter>("all");
  const [showAdd, setShowAdd] = useState(false);

  const assignments = useMemo(() => assignmentsQuery.data ?? [], [assignmentsQuery.data]);
  const subjects = subjectsQuery.data ?? [];
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const filtered = useMemo(() => {
    const list = filter === "all" ? [...assignments] : assignments.filter((a) => a.status === filter);
    return list.sort((a, b) => a.due_date.localeCompare(b.due_date));
  }, [assignments, filter]);

  if (assignmentsQuery.isLoading) return <RowSkeleton rows={4} />;

  return (
    <>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: filter === f.id ? "#6C63FF" : "#161622",
              color: filter === f.id ? "#FFFFFF" : "#8888A8",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          illustration="events"
          title={assignments.length === 0 ? "No assignments" : "Nothing here"}
          description={
            assignments.length === 0
              ? "Track due dates and submission status for every assignment."
              : "Nothing matches this filter."
          }
          actionLabel={assignments.length === 0 ? "Add Assignment" : undefined}
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
    </>
  );
}
