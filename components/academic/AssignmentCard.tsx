"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useDeleteAssignment, useUpdateAssignmentStatus } from "@/hooks/useAcademicWork";
import { daysLabel, daysUntil, formatDate } from "@/lib/utils";
import type { Assignment, AssignmentStatus, Subject } from "@/lib/supabase/types";

const STATUS_META: Record<AssignmentStatus, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#FFB347" },
  submitted: { label: "Submitted", color: "#5AB0FF" },
  graded: { label: "Graded", color: "#43D98C" },
  late: { label: "Late", color: "#FF5C5C" },
};

const NEXT_STATUS: Record<AssignmentStatus, AssignmentStatus | null> = {
  pending: "submitted",
  submitted: "graded",
  graded: null,
  late: "submitted",
};

export function AssignmentCard({
  assignment,
  subject,
  index = 0,
}: {
  assignment: Assignment;
  subject?: Subject;
  index?: number;
}) {
  const updateStatus = useUpdateAssignmentStatus();
  const deleteAssignment = useDeleteAssignment();
  const meta = STATUS_META[assignment.status];
  const days = daysUntil(assignment.due_date);
  const isOverduePending = assignment.status === "pending" && days < 0;
  const effectiveMeta = isOverduePending ? STATUS_META.late : meta;
  const next = NEXT_STATUS[assignment.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: Math.min(0.3, 0.03 * index) }}
      className="bg-card border border-line rounded-card p-4"
      style={{ borderLeftColor: effectiveMeta.color, borderLeftWidth: 3 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color={effectiveMeta.color}>{effectiveMeta.label}</Badge>
            {subject && <Badge color={subject.color}>{subject.name}</Badge>}
          </div>
          <p className="mt-1.5 font-semibold leading-snug">{assignment.title}</p>
          <p className="mt-0.5 text-xs text-ink-dim">
            Due {formatDate(assignment.due_date, { withYear: true })} · {daysLabel(days)}
            {assignment.description ? ` · ${assignment.description}` : ""}
          </p>
          {assignment.status === "graded" && assignment.score !== null && (
            <p className="mt-1 text-xs font-semibold" style={{ color: effectiveMeta.color }}>
              Score: {assignment.score}
              {assignment.max_score ? ` / ${assignment.max_score}` : ""}
            </p>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => deleteAssignment.mutate(assignment.id)}
          aria-label={`Delete ${assignment.title}`}
          className="p-2 rounded-input text-ink-faint hover:text-danger hover:bg-danger-dim transition-colors shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>

      {next && (
        <button
          onClick={() => updateStatus.mutate({ id: assignment.id, status: next })}
          className="mt-3 w-full h-9 rounded-input text-xs font-bold border border-line text-ink-dim hover:text-ink hover:border-primary/50 transition-colors"
        >
          Mark as {STATUS_META[next].label}
        </button>
      )}
    </motion.div>
  );
}
