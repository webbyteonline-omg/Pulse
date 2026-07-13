"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { PROFILE_COLUMNS } from "@/lib/supabase/columns";
import { attendancePercent, formatINR } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { WrappedShell, type WrappedStat } from "./WrappedShell";

export function SemesterWrapped({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const semesterStart = useSettingsStore((s) => s.semesterStart);

  const { data } = useQuery({
    queryKey: ["wrapped-semester", semesterStart],
    enabled: !!user,
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const since = semesterStart ?? "2000-01-01";
      const [
        { data: subjects },
        { data: expenses },
        { data: checkins },
        { data: scores },
        { data: profile },
      ] = await Promise.all([
        supabase.from("subjects").select("id,name,total_classes,attended_classes"),
        supabase
          .from("expenses")
          .select("id,amount,date")
          .eq("transaction_type", "expense")
          .gte("date", since),
        supabase
          .from("daily_checkins")
          .select("id,date,mood,steps")
          .eq("user_id", user!.id)
          .gte("date", since),
        supabase
          .from("pulse_scores")
          .select("id,user_id,date,score")
          .eq("user_id", user!.id)
          .order("date"),
        supabase.from("user_profiles").select(PROFILE_COLUMNS).eq("id", user!.id).maybeSingle(),
      ]);
      return {
        subjects: subjects ?? [],
        expenses: expenses ?? [],
        checkins: checkins ?? [],
        scores: scores ?? [],
        profile,
      };
    },
  });

  if (!data) return null;

  const totalAttended = data.subjects.reduce((sum, s) => sum + s.attended_classes, 0);
  const totalClasses = data.subjects.reduce((sum, s) => sum + s.total_classes, 0);
  const missed = totalClasses - totalAttended;
  const tracked = data.subjects.filter((s) => s.total_classes > 0);
  const avgAttendance =
    tracked.length > 0
      ? (
          tracked.reduce((sum, s) => sum + attendancePercent(s.attended_classes, s.total_classes), 0) /
          tracked.length
        ).toFixed(1)
      : null;

  const mostSkipped = [...tracked]
    .map((s) => ({ name: s.name, missed: s.total_classes - s.attended_classes }))
    .sort((a, b) => b.missed - a.missed)[0];

  const spent = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalSteps = data.checkins.reduce((sum, c) => sum + (c.steps ?? 0), 0);

  const firstScore = data.scores[0];
  const lastScore = data.scores[data.scores.length - 1];
  const daysUsing = data.profile
    ? Math.max(1, Math.floor((Date.now() - new Date(data.profile.created_at).getTime()) / 86_400_000))
    : null;

  const stats: WrappedStat[] = [
    {
      label: "Classes attended",
      value: `${totalAttended}`,
      sub: missed > 0 ? `and ${missed} strategically skipped 😂` : "not a single miss. legend.",
      big: true,
    },
    {
      label: "Average attendance",
      value: avgAttendance !== null ? `${avgAttendance}%` : "No data yet",
    },
    ...(mostSkipped && mostSkipped.missed > 0
      ? [
          {
            label: "Most skipped subject 😂",
            value: mostSkipped.name,
            sub: `${mostSkipped.missed} classes bunked`,
          },
        ]
      : []),
    { label: "Money spent this semester", value: formatINR(spent), big: true },
    ...(totalSteps > 0
      ? [
          {
            label: "Total steps",
            value: totalSteps.toLocaleString("en-IN"),
            sub: `≈ ${(totalSteps * 0.000762).toFixed(0)} km on foot`,
          },
        ]
      : []),
    ...(firstScore && lastScore && data.scores.length > 1
      ? [
          {
            label: "Pulse Score journey",
            value: `${firstScore.score} → ${lastScore.score}`,
            sub: lastScore.score >= firstScore.score ? "trending up 📈" : "comeback season loading…",
          },
        ]
      : []),
    ...(daysUsing !== null
      ? [{ label: "Days with DockIn", value: `${daysUsing}`, sub: "thanks for being here 💜" }]
      : []),
  ];

  return (
    <WrappedShell
      type="semester"
      title="Semester, wrapped"
      subtitle={semesterStart ? `since ${semesterStart}` : "all time"}
      stats={stats}
      onClose={onClose}
    />
  );
}
