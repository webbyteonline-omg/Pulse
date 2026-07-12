"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { CountdownCard } from "@/components/academic/CountdownCard";
import { EventCard } from "@/components/academic/EventCard";
import { EventFormModal } from "@/components/academic/EventFormModal";
import { useDeleteEvent, useEvents } from "@/hooks/useAcademic";
import { useSubjects } from "@/hooks/useAttendance";
import { EVENT_TYPE_META, daysUntil } from "@/lib/utils";
import type { EventType } from "@/lib/supabase/types";

// Pulls in pdfjs-dist (massive) for PDF calendar parsing — split out and
// only loaded when this page actually mounts.
const CalendarUpload = dynamic(
  () => import("@/components/academic/CalendarUpload").then((m) => m.CalendarUpload),
  { ssr: false, loading: () => <Skeleton className="h-24 w-full rounded-card mb-6" /> }
);

type Tab = "upcoming" | "past" | "all";
type TypeFilter = "all" | EventType;

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "all", label: "All" },
];

const TYPE_FILTERS: TypeFilter[] = ["all", "exam", "quiz", "assignment", "holiday", "other"];

export default function AcademicPage() {
  return (
    <Suspense>
      <AcademicContent />
    </Suspense>
  );
}

function AcademicContent() {
  const searchParams = useSearchParams();
  const eventsQuery = useEvents();
  const subjectsQuery = useSubjects();
  const deleteEvent = useDeleteEvent();
  const [tab, setTab] = useState<Tab>("upcoming");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [showAdd, setShowAdd] = useState(false);

  // Quick-add FAB deep link (/academic?add=1)
  useEffect(() => {
    if (searchParams.get("add") === "1") setShowAdd(true);
  }, [searchParams]);

  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const subjects = subjectsQuery.data ?? [];
  const subjectById = new Map(subjects.map((s) => [s.id, s]));

  const nextExam = events
    .filter((e) => (e.event_type === "exam" || e.event_type === "quiz") && daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  const nextHoliday = events
    .filter((e) => e.event_type === "holiday" && daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const filtered = useMemo(() => {
    let list = events;
    if (tab === "upcoming") {
      list = list.filter((e) => daysUntil(e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date));
    } else if (tab === "past") {
      list = list.filter((e) => daysUntil(e.date) < 0).sort((a, b) => b.date.localeCompare(a.date));
    } else {
      list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    }
    if (typeFilter !== "all") {
      list = list.filter((e) => (e.event_type ?? "other") === typeFilter);
    }
    return list;
  }, [events, tab, typeFilter]);

  return (
    <div>
      <Header
        title="Academic Calendar"
        subtitle="Exams, holidays & deadlines"
        action={
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="h-4 w-4" /> Event
          </Button>
        }
      />

      {/* Pinned countdowns */}
      {(nextExam || nextHoliday) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {nextExam && <CountdownCard event={nextExam} tone="exam" />}
          {nextHoliday && <CountdownCard event={nextHoliday} tone="holiday" />}
        </div>
      )}

      <CalendarUpload />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-line rounded-btn p-1 mb-3">
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

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-4 px-4">
        {TYPE_FILTERS.map((type) => {
          const active = typeFilter === type;
          const meta = type === "all" ? null : EVENT_TYPE_META[type];
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
              style={{
                backgroundColor: active ? `${meta?.color ?? "#6C63FF"}26` : "transparent",
                borderColor: active ? (meta?.color ?? "#6C63FF") : "#2A2A3A",
                color: active ? (meta?.color ?? "#6C63FF") : "#8888A0",
              }}
            >
              {meta ? `${meta.emoji} ${meta.label}` : "All types"}
            </button>
          );
        })}
      </div>

      {eventsQuery.isLoading ? (
        <RowSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="events"
          title={tab === "past" ? "No past events" : "Nothing scheduled"}
          description={
            events.length === 0
              ? "Upload your academic calendar PDF above, or add events manually — Pulse will remind you before each one."
              : "No events match this filter."
          }
          actionLabel={events.length === 0 ? "Add an event" : undefined}
          onAction={events.length === 0 ? () => setShowAdd(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                subject={event.subject_id ? subjectById.get(event.subject_id) : undefined}
                onDelete={(id) => deleteEvent.mutate(id)}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <FAB label="Add event" onClick={() => setShowAdd(true)} />
      <EventFormModal open={showAdd} onClose={() => setShowAdd(false)} subjects={subjects} />
    </div>
  );
}
