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
            className="shrink-0 min-h-[32px] px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors"
            style={{
              backgroundColor: tab === t.id ? "#6C63FF" : "rgba(108,99,255,0.12)",
              color: tab === t.id ? "#FFFFFF" : "#9B97FF",
              border: tab === t.id ? "1px solid transparent" : "1px solid rgba(108,99,255,0.2)",
            }}
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
