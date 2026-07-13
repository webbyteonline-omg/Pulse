"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { BunkCalculator } from "@/components/attendance/BunkCalculator";
import { AttendanceCalendar } from "@/components/attendance/AttendanceCalendar";
import { SubjectFormModal } from "@/components/attendance/SubjectFormModal";
import { useDeleteSubject, useSubject } from "@/hooks/useAttendance";
import { attendanceHealth, attendancePercent } from "@/lib/utils";

const HEALTH_COLORS = { good: "#43D98C", warning: "#FFB347", danger: "#FF5C5C" } as const;

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const subjectQuery = useSubject(id);
  const deleteSubject = useDeleteSubject();
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const subject = subjectQuery.data;

  if (subjectQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-44 w-full rounded-card" />
        <Skeleton className="h-56 w-full rounded-card" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-dim">Subject not found.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/attendance")}>
          Back to attendance
        </Button>
      </div>
    );
  }

  const pct = attendancePercent(subject.attended_classes, subject.total_classes);
  const health = attendanceHealth(
    subject.attended_classes,
    subject.total_classes,
    subject.required_percentage
  );
  const color = HEALTH_COLORS[health];
  const absent = subject.total_classes - subject.attended_classes;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push("/attendance")}
          aria-label="Back"
          className="p-2 -ml-2 rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
        <h1 className="flex-1 min-w-0 text-lg font-bold truncate">{subject.name}</h1>
        <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)} aria-label="Delete subject">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Big animated percentage */}
      <Card gradient className="p-6 mb-4 text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 160, delay: 0.1 }}
          className="text-6xl font-black tracking-tighter tabular-nums"
          style={{ color }}
        >
          {subject.total_classes === 0 ? "—" : `${pct}%`}
        </motion.p>
        <p className="mt-1 text-sm text-ink-dim">
          required {subject.required_percentage}%
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: subject.total_classes },
            { label: "Attended", value: subject.attended_classes },
            { label: "Absent", value: absent },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
              className="clay-inset rounded-btn py-3"
            >
              <p className="text-xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-[11px] text-ink-dim">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <BunkCalculator subject={subject} />
        <AttendanceCalendar subjectId={subject.id} />
      </div>

      <SubjectFormModal open={showEdit} onClose={() => setShowEdit(false)} subject={subject} />

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete subject?"
        variant="center"
      >
        <p className="text-sm text-ink-dim">
          This removes <span className="font-semibold text-ink">{subject.name}</span> and its
          full attendance history. This can&apos;t be undone.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={deleteSubject.isPending}
            onClick={async () => {
              await deleteSubject.mutateAsync(subject.id);
              router.push("/attendance");
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
