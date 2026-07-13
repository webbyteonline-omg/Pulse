"use client";

import { useState } from "react";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { OverallCard } from "@/components/attendance/OverallCard";
import { SubjectCard } from "@/components/attendance/SubjectCard";
import { SubjectFormModal } from "@/components/attendance/SubjectFormModal";
import { useSubjects } from "@/hooks/useAttendance";

/** Attendance tab — isolated so its data only loads while this tab is active. */
export function AttendanceSection() {
  const subjectsQuery = useSubjects();
  const [showAdd, setShowAdd] = useState(false);
  const subjects = subjectsQuery.data ?? [];

  if (subjectsQuery.isLoading) return <RowSkeleton rows={4} />;

  if (subjects.length === 0) {
    return (
      <>
        <EmptyState
          illustration="subjects"
          title="No subjects yet"
          description="Add your subjects and mark attendance after each class — DockIn will tell you exactly how many you can bunk."
          actionLabel="Add your first subject"
          onAction={() => setShowAdd(true)}
        />
        <SubjectFormModal open={showAdd} onClose={() => setShowAdd(false)} />
      </>
    );
  }

  return (
    <>
      <OverallCard subjects={subjects} />

      <div className="flex items-center justify-between mt-4 mb-2.5">
        <span className="text-[15px] font-semibold text-ink">Your Subjects</span>
        <button
          onClick={() => setShowAdd(true)}
          className="min-h-[44px] flex items-center gap-1 px-0 text-[13px] font-medium text-primary"
        >
          + Add Subject
        </button>
      </div>

      <div className="space-y-2">
        {subjects.map((subject, i) => (
          <SubjectCard key={subject.id} subject={subject} index={i} />
        ))}
      </div>

      <SubjectFormModal open={showAdd} onClose={() => setShowAdd(false)} />
    </>
  );
}
