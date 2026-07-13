"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { AlertBanners } from "@/components/dashboard/AlertBanner";
import { FriendActivity } from "@/components/dashboard/FriendActivity";
import { LeaderboardCard } from "@/components/dashboard/LeaderboardCard";
import { NotificationSheet } from "@/components/dashboard/NotificationSheet";
import { PulseScoreCard } from "@/components/dashboard/PulseScoreCard";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { QuickTiles } from "@/components/dashboard/QuickTiles";
import { TodayClasses } from "@/components/dashboard/TodayClasses";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary";
import { PageHeader } from "@/components/ui/PageHeader";
import { CardSkeleton, RowSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useEvents } from "@/hooks/useAcademic";
import { useAssignments } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";
import { useBudgets, useExpenses } from "@/hooks/useFinance";
import { useLivePulseScore, useTodayCheckin } from "@/hooks/useProfile";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { attendancePercent, daysUntil, formatINR, nowIST, todayIST } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const now = nowIST();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const subjectsQuery = useSubjects();
  const eventsQuery = useEvents();
  const expensesQuery = useExpenses(month, year);
  const budgetsQuery = useBudgets(month, year);
  const checkinQuery = useTodayCheckin();
  const { breakdown } = useLivePulseScore();
  const assignmentsQuery = useAssignments();

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
    .filter((e) => e.date === today && e.transaction_type !== "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const tracked = subjects.filter((s) => s.total_classes > 0);
  const avgAttendance =
    tracked.length > 0
      ? tracked.reduce(
          (sum, s) => sum + attendancePercent(s.attended_classes, s.total_classes),
          0
        ) / tracked.length
      : null;

  const tasksDue = events.filter((e) => {
    const d = daysUntil(e.date);
    return d >= 0 && d <= 7 && e.event_type !== "holiday";
  }).length;

  const monthSpend = expenses
    .filter((e) => e.transaction_type !== "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingAssignments = (assignmentsQuery.data ?? []).filter(
    (a) => a.status === "pending"
  ).length;

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

      <PageHeader
        title="DockIn"
        showGreeting
        showBell
        onBellClick={() => setNotificationsOpen(true)}
      />

      {loading ? (
        <div className="space-y-5">
          <Skeleton className="h-44 w-full rounded-card" />
          <div className="grid grid-cols-4 gap-2">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
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

          {breakdown && <PulseScoreCard breakdown={breakdown} />}

          <QuickStats
            attendancePct={avgAttendance}
            pendingAssignments={pendingAssignments}
            spentThisMonth={formatINR(monthSpend)}
          />

          <LeaderboardCard />

          <Link
            href="/groups"
            className="flex items-center justify-between px-1 -mt-3 mb-5 text-xs font-semibold text-primary"
          >
            Group leaderboards
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>

          <QuickTiles
            attendancePct={avgAttendance}
            todaySpend={todaySpend}
            tasksDue={tasksDue}
            stepsToday={checkinQuery.data?.steps ?? null}
          />

          <TodayClasses />
          <FriendActivity />
          <UpcomingEvents events={events} />
          <AttendanceSummary subjects={subjects} />

          <LastUpdated at={expensesQuery.dataUpdatedAt} />
        </>
      )}

      <NotificationSheet open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
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
