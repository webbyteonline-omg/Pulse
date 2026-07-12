"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
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
        {assignments.length > 0 && (
          <button
            onClick={() => setShowAdd(true)}
            aria-label="Add assignment"
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

      <AssignmentFormModal open={showAdd} onClose={() => setShowAdd(false)} subjects={subjects} />
    </>
  );
}
