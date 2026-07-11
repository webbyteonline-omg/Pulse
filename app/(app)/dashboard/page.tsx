"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { AlertBanners } from "@/components/dashboard/AlertBanner";
import { CheckinCard } from "@/components/dashboard/CheckinCard";
import { TodayCard } from "@/components/dashboard/TodayCard";
import { TodayClasses } from "@/components/dashboard/TodayClasses";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary";
import { CardSkeleton, RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

// Both pull in Recharts — split out of the main bundle and only fetched
// once the rest of the dashboard has already painted.
const SpendingSummary = dynamic(
  () => import("@/components/dashboard/SpendingSummary").then((m) => m.SpendingSummary),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-card" /> }
);
const ScoreGauge = dynamic(
  () => import("@/components/pulse-score/ScoreGauge").then((m) => m.ScoreGauge),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-card" /> }
);
import { EmptyState } from "@/components/ui/EmptyState";
import { useEvents } from "@/hooks/useAcademic";
import { useSubjects } from "@/hooks/useAttendance";
import { useBudgets, useExpenses } from "@/hooks/useFinance";
import { useLivePulseScore } from "@/hooks/useProfile";
import { useTodayClasses } from "@/hooks/useTimetable";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import {
  daysLabel,
  daysUntil,
  formatINR,
  greeting,
  attendancePercent,
  nowIST,
  todayIST,
} from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const displayName = useAuthStore((s) => s.displayName)();

  const now = nowIST();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const subjectsQuery = useSubjects();
  const eventsQuery = useEvents();
  const expensesQuery = useExpenses(month, year);
  const budgetsQuery = useBudgets(month, year);
  const { breakdown } = useLivePulseScore();
  const todayClassesQuery = useTodayClasses();

  const { ref, pull, refreshing } = usePullToRefresh(async () => {
    await queryClient.invalidateQueries();
  });

  const loading =
    subjectsQuery.isLoading || eventsQuery.isLoading || expensesQuery.isLoading;

  const subjects = useMemo(() => subjectsQuery.data ?? [], [subjectsQuery.data]);
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const expenses = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data]);
  const budgets = useMemo(() => budgetsQuery.data ?? [], [budgetsQuery.data]);

  const today = todayIST();
  const todaySpend = expenses
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const nextEvent = events
    .filter((e) => daysUntil(e.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const atRisk = subjects.filter(
    (s) =>
      s.total_classes > 0 &&
      attendancePercent(s.attended_classes, s.total_classes) < s.required_percentage
  );

  const classesToday = todayClassesQuery.data.length;
  const dateLine = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const isEmpty =
    !loading && subjects.length === 0 && events.length === 0 && expenses.length === 0;

  return (
    <div ref={ref} className="min-h-[70dvh]">
      {/* Pull-to-refresh indicator */}
      <AnimatePresence>
        {(pull > 0 || refreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: Math.max(pull, refreshing ? 48 : 0), opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden md:hidden"
          >
            <Loader2
              className={`h-5 w-5 text-primary ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: refreshing ? undefined : `rotate(${pull * 3}deg)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Header
        title={`${greeting()}, ${displayName}`}
        subtitle={dateLine}
        showBell
      />

      {loading ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <Skeleton className="h-32 w-full rounded-card" />
          <RowSkeleton rows={3} />
        </div>
      ) : isEmpty ? (
        <EmptyState
          illustration="generic"
          title="Let's set up your semester"
          description="Add your subjects to track attendance, upload your academic calendar, and log your first expense."
          actionLabel="Add subjects"
          onAction={() => router.push("/attendance")}
        />
      ) : (
        <>
          <AlertBanners events={events} subjects={subjects} />

          {/* Today at a glance */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <TodayCard
              index={0}
              emoji="💰"
              label="Today's spend"
              value={formatINR(todaySpend)}
              sub={todaySpend === 0 ? "Nothing yet — nice" : undefined}
              tone={todaySpend > 500 ? "warning" : "default"}
            />
            <TodayCard
              index={1}
              emoji="📚"
              label="Classes today"
              value={classesToday === 0 ? "None" : `${classesToday} ${classesToday === 1 ? "class" : "classes"}`}
              sub={classesToday > 0 ? "Mark attendance after each" : "Build your timetable"}
            />
            <TodayCard
              index={2}
              emoji="📅"
              label="Next event"
              value={nextEvent ? daysLabel(daysUntil(nextEvent.date)) : "Nothing"}
              sub={nextEvent?.title}
              tone={nextEvent && daysUntil(nextEvent.date) <= 2 ? "danger" : "default"}
            />
            <TodayCard
              index={3}
              emoji="✅"
              label="Attendance health"
              value={
                subjects.length === 0
                  ? "—"
                  : atRisk.length === 0
                    ? "All good"
                    : `${atRisk.length} at risk`
              }
              tone={atRisk.length === 0 ? "success" : "danger"}
              sub={atRisk.length > 0 ? atRisk.map((s) => s.name).join(", ") : undefined}
            />
          </div>

          {breakdown && (
            <div className="mb-6">
              <ScoreGauge breakdown={breakdown} />
            </div>
          )}

          <CheckinCard />
          <TodayClasses />
          <UpcomingEvents events={events} />
          <AttendanceSummary subjects={subjects} />
          <SpendingSummary expenses={expenses} budgets={budgets} />

          <LastUpdated at={expensesQuery.dataUpdatedAt} />
        </>
      )}
    </div>
  );
}

/** "Last updated X min ago" — matters when reading cached data offline. */
function LastUpdated({ at }: { at: number }) {
  if (!at) return null;
  const mins = Math.floor((Date.now() - at) / 60_000);
  if (mins < 1) return null;
  return (
    <p className="text-center text-[11px] text-ink-faint pb-2">
      Last updated {mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)}h`} ago
      {typeof navigator !== "undefined" && !navigator.onLine ? " · offline" : ""}
    </p>
  );
}
