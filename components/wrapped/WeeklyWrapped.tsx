"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { CATEGORY_META, formatINR, weekStartIST } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { WrappedShell, type WrappedStat } from "./WrappedShell";
import type { ExpenseCategory } from "@/lib/supabase/types";

export function WeeklyWrapped({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);

  const { data } = useQuery({
    queryKey: ["wrapped-weekly"],
    enabled: !!user,
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const thisWeekStart = weekStartIST();
      const lastWeekStart = new Date(thisWeekStart);
      lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);
      const lastStart = lastWeekStart.toISOString().slice(0, 10);

      const [{ data: checkins }, { data: expenses }, { data: logs }] = await Promise.all([
        supabase
          .from("daily_checkins")
          .select("id,date,mood,steps")
          .eq("user_id", user!.id)
          .gte("date", lastStart),
        supabase
          .from("expenses")
          .select("id,amount,category,date")
          .eq("transaction_type", "expense")
          .gte("date", thisWeekStart),
        supabase
          .from("attendance_logs")
          .select("id,status,date")
          .eq("user_id", user!.id)
          .gte("date", thisWeekStart),
      ]);
      return { checkins: checkins ?? [], expenses: expenses ?? [], logs: logs ?? [], thisWeekStart };
    },
  });

  if (!data) return null;

  const thisWeek = data.checkins.filter((c) => c.date >= data.thisWeekStart);
  const lastWeek = data.checkins.filter((c) => c.date < data.thisWeekStart);
  const stepsThis = thisWeek.reduce((sum, c) => sum + (c.steps ?? 0), 0);
  const stepsLast = lastWeek.reduce((sum, c) => sum + (c.steps ?? 0), 0);
  const stepsDelta = stepsLast > 0 ? Math.round(((stepsThis - stepsLast) / stepsLast) * 100) : null;

  const spent = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of data.expenses) {
    const cat = (e.category as ExpenseCategory | null) ?? "others";
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(e.amount));
  }
  const topCat = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  const present = data.logs.filter((l) => l.status === "present").length;
  const attendanceRate = data.logs.length > 0 ? Math.round((present / data.logs.length) * 100) : null;

  const moods = thisWeek.map((c) => c.mood).filter((m): m is number => m !== null);
  const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null;

  const byDay = new Map<string, number>();
  for (const c of thisWeek) byDay.set(c.date, (byDay.get(c.date) ?? 0) + (c.steps ?? 0));
  const mostActive = [...byDay.entries()].sort((a, b) => b[1] - a[1])[0];
  const km = (stepsThis * 0.000762).toFixed(1);

  const stats: WrappedStat[] = [
    {
      label: "Steps this week",
      value: stepsThis.toLocaleString("en-IN"),
      sub: stepsDelta !== null ? `${stepsDelta >= 0 ? "↑" : "↓"} ${Math.abs(stepsDelta)}% vs last week` : undefined,
      big: true,
    },
    { label: "You walked", value: `${km} km`, sub: "keep those chappals moving 👟" },
    {
      label: "Total spent",
      value: formatINR(spent),
      sub: topCat ? `mostly on ${CATEGORY_META[topCat[0]].label} (${formatINR(topCat[1])})` : undefined,
      big: true,
    },
    {
      label: "Attendance this week",
      value: attendanceRate !== null ? `${attendanceRate}%` : "No classes marked",
    },
    { label: "Average mood", value: avgMood !== null ? `${avgMood}/5` : "Not logged" },
    ...(mostActive && mostActive[1] > 0
      ? [
          {
            label: "Most active day",
            value: new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: "UTC" }).format(
              new Date(`${mostActive[0]}T12:00:00Z`)
            ),
            sub: `${mostActive[1].toLocaleString("en-IN")} steps`,
          },
        ]
      : []),
  ];

  return (
    <WrappedShell type="weekly" title="Your week, wrapped" subtitle="Monday to today" stats={stats} onClose={onClose} />
  );
}
