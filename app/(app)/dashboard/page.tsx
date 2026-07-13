"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { StoriesRow } from "@/components/dashboard/StoriesRow";
import { WhosFreeBar } from "@/components/dashboard/WhosFreeBar";
import { FriendActivity } from "@/components/dashboard/FriendActivity";
import { GroupActivity } from "@/components/dashboard/GroupActivity";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { TodayClasses } from "@/components/dashboard/TodayClasses";
import { AlertBanners } from "@/components/dashboard/AlertBanner";
import { NotificationSheet } from "@/components/dashboard/NotificationSheet";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEvents } from "@/hooks/useAcademic";
import { useAssignments } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";
import { useExpenses } from "@/hooks/useFinance";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { attendancePercent, formatINR, nowIST } from "@/lib/utils";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const now = nowIST();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const subjectsQuery = useSubjects();
  const eventsQuery = useEvents();
  const expensesQuery = useExpenses(month, year);
  const assignmentsQuery = useAssignments();

  const { ref, pull, refreshing } = usePullToRefresh(async () => {
    await queryClient.invalidateQueries();
  });

  const subjects = useMemo(() => subjectsQuery.data ?? [], [subjectsQuery.data]);
  const events = useMemo(() => eventsQuery.data ?? [], [eventsQuery.data]);
  const expenses = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data]);

  const tracked = subjects.filter((s) => s.total_classes > 0);
  const avgAttendance =
    tracked.length > 0
      ? tracked.reduce((sum, s) => sum + attendancePercent(s.attended_classes, s.total_classes), 0) /
        tracked.length
      : null;

  const monthSpend = expenses
    .filter((e) => e.transaction_type !== "income")
    .reduce((sum, e) => sum + Number(e.amount), 0);
  const pendingAssignments = (assignmentsQuery.data ?? []).filter((a) => a.status === "pending").length;

  const hasUtility = subjects.length > 0 || events.length > 0 || expenses.length > 0;
  const loadingSocial = subjectsQuery.isLoading && eventsQuery.isLoading;

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
              className={`h-5 w-5 text-clay-purple ${refreshing ? "animate-spin" : ""}`}
              style={{ transform: refreshing ? undefined : `rotate(${pull * 3}deg)` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader title="DockIn" showGreeting showBell onBellClick={() => setNotificationsOpen(true)} />

      {/* ① Stories */}
      <StoriesRow />

      {/* ② Who's free broadcast */}
      <WhosFreeBar />

      {/* ③ Friends live */}
      <FriendActivity />

      {/* ④ Group activity */}
      <GroupActivity />

      {/* ⑤ + ⑥ Secondary utility cluster */}
      {loadingSocial ? (
        <Skeleton className="h-20 w-full rounded-card" />
      ) : hasUtility ? (
        <>
          <AlertBanners events={events} subjects={subjects} />
          <QuickStats
            attendancePct={avgAttendance}
            pendingAssignments={pendingAssignments}
            spentThisMonth={formatINR(monthSpend)}
          />
          <TodayClasses />
        </>
      ) : null}

      <NotificationSheet open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
