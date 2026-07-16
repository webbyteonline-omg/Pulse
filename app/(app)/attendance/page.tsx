"use client";

import { Suspense, useState } from "react";
import { Header } from "@/components/layout/Header";
import { AttendanceSection } from "@/components/academic/AttendanceSection";
import { AssignmentsSection } from "@/components/academic/AssignmentsSection";
import { QuizzesSection } from "@/components/academic/QuizzesSection";
import { ExamsSection } from "@/components/academic/ExamsSection";
import { SectionSkeleton } from "@/components/academic/SectionSkeleton";

type Tab = "attendance" | "assignments" | "quizzes" | "exams";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "attendance", label: "Attendance" },
  { id: "assignments", label: "Assignments" },
  { id: "quizzes", label: "Quizzes" },
  { id: "exams", label: "Exams" },
];

/**
 * Academics — single page, 4 pill tabs. Only the ACTIVE tab's section is
 * mounted (and thus only its data is fetched); switching tabs shows a
 * skeleton instantly via Suspense while that tab's own React Query call
 * resolves (staleTime keeps it snappy on repeat visits).
 */
export default function AcademicsPage() {
  const [tab, setTab] = useState<Tab>("attendance");

  return (
    <div>
      <Header title="Academics" />

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4" style={{ padding: "0 0 4px" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              tab === t.id
                ? "genz-gradient shrink-0 min-h-[32px] rounded-full border border-transparent px-4 py-1.5 text-[13px] font-bold text-white transition-colors"
                : "shrink-0 min-h-[32px] rounded-full border border-primary/20 bg-primary-dim px-4 py-1.5 text-[13px] font-medium text-primary transition-colors"
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pb-24">
        <Suspense fallback={<SectionSkeleton />}>
          {tab === "attendance" && <AttendanceSection />}
          {tab === "assignments" && <AssignmentsSection />}
          {tab === "quizzes" && <QuizzesSection />}
          {tab === "exams" && <ExamsSection />}
        </Suspense>
      </div>
    </div>
  );
}
