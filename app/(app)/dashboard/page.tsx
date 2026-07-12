"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Loader2 } from "lucide-react";
import { AlertBanners } from "@/components/dashboard/AlertBanner";
import { FriendActivity } from "@/components/dashboard/FriendActivity";
import { PulseScoreCard } from "@/components/dashboard/PulseScoreCard";
import { QuickTiles } from "@/components/dashboard/QuickTiles";
import { TodayClasses } from "@/components/dashboard/TodayClasses";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { AttendanceSummary } from "@/components/dashboard/AttendanceSummary";
import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { WeatherChip } from "@/components/dashboard/WeatherChip";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { CardSkeleton, RowSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useEvents } from "@/hooks/useAcademic";
import { useSubjects } from "@/hooks/useAttendance";
import { useBudgets, useExpenses } from "@/hooks/useFinance";
import { useFriendRequests } from "@/hooks/useFriends";
import { useLivePulseScore, useMyProfile, useTodayCheckin } from "@/hooks/useProfile";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import {
  attendancePercent,
  daysUntil,
  greeting,
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
  const profileQuery = useMyProfile();
  const checkinQuery = useTodayCheckin();
  const { breakdown } = useLivePulseScore();
  const { data: requests } = useFriendRequests();

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

  const pendingRequests = (requests ?? []).filter((r) => r.direction === "incoming").length;
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

      {/* Top bar — greeting + weather + bell + avatar (mockup style) */}
      <header className="flex items-center gap-3 mb-6">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-ink-dim">{greeting()}, 👋</p>
          <h1 className="text-2xl font-black tracking-tight truncate">{displayName}</h1>
        </div>
        <WeatherChip />
        <Link href="/friends?tab=requests" aria-label="Notifications">
          <motion.span
            whileTap={{ scale: 0.85 }}
            className="relative grid place-items-center h-11 w-11 rounded-btn bg-card border border-line text-ink-dim"
          >
            <Bell className="h-[18px] w-[18px]" />
            {pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">
                {pendingRequests > 9 ? "9+" : pendingRequests}
              </span>
            )}
          </motion.span>
        </Link>
        <Link href="/profile" aria-label="Profile">
          <motion.span whileTap={{ scale: 0.9 }} className="block">
            <Avatar
              name={displayName}
              size={44}
              showOnline={false}
              src={profileQuery.data?.avatar_url}
            />
          </motion.span>
        </Link>
      </header>

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
