"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ACADEMIC_TABS, SubTabs } from "@/components/layout/SubTabs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { OverallCard } from "@/components/attendance/OverallCard";
import { SubjectCard } from "@/components/attendance/SubjectCard";
import { SubjectFormModal } from "@/components/attendance/SubjectFormModal";
import { useSubjects } from "@/hooks/useAttendance";

export default function AttendancePage() {
  const subjectsQuery = useSubjects();
  const [showAdd, setShowAdd] = useState(false);
  const subjects = subjectsQuery.data ?? [];

  return (
    <div>
      <Header
        title="Attendance"
        subtitle={subjects.length > 0 ? `${subjects.length} subjects tracked` : undefined}
        action={
          <Button size="md" onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Subject
          </Button>
        }
      />
      <SubTabs tabs={ACADEMIC_TABS} layoutId="academic-tabs" />

      {subjectsQuery.isLoading ? (
        <RowSkeleton rows={4} />
      ) : subjects.length === 0 ? (
        <EmptyState
          illustration="subjects"
          title="No subjects yet"
          description="Add your subjects and mark attendance after each class — Pulse will tell you exactly how many you can bunk."
          actionLabel="Add your first subject"
          onAction={() => setShowAdd(true)}
        />
      ) : (
        <>
          <OverallCard subjects={subjects} />
          <h2 className="text-lg font-semibold mb-3">Subject Wise Attendance</h2>
          <div className="space-y-3">
            {subjects.map((subject, i) => (
              <SubjectCard key={subject.id} subject={subject} index={i} />
            ))}
          </div>
        </>
      )}

      <FAB label="Add subject" onClick={() => setShowAdd(true)} />
      <SubjectFormModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}
