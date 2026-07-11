"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { CATEGORY_META, formatINR, todayIST } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { WrappedShell, type WrappedStat } from "./WrappedShell";
import type { ExpenseCategory } from "@/lib/supabase/types";

const MOOD_LABELS = ["", "Rough 😞", "Meh 😕", "Okay 😐", "Good 🙂", "Great 😄"];

export function DailyWrapped({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const today = todayIST();

  const { data } = useQuery({
    queryKey: ["wrapped-daily"],
    enabled: !!user,
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const [{ data: checkin }, { data: expenses }, { data: logs }] = await Promise.all([
        supabase
          .from("daily_checkins")
          .select("id,user_id,date,mood,steps,created_at")
          .eq("user_id", user!.id)
          .eq("date", today)
          .maybeSingle(),
        supabase.from("expenses").select("id,amount,category,date").eq("date", today),
        supabase
          .from("attendance_logs")
          .select("id,user_id,subject_id,date,status,created_at")
          .eq("user_id", user!.id)
          .eq("date", today),
      ]);
      return { checkin, expenses: expenses ?? [], logs: logs ?? [] };
    },
  });

  if (!data) return null;

  const spent = data.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const attended = data.logs.filter((l) => l.status === "present").length;

  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of data.expenses) {
    const cat = e.category ?? "others";
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(e.amount));
  }
  const topCategory = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0];

  const stats: WrappedStat[] = [
    {
      label: "Steps today",
      value: data.checkin?.steps !== null && data.checkin?.steps !== undefined
        ? `${data.checkin.steps.toLocaleString("en-IN")}`
        : "Not logged",
      big: true,
    },
    { label: "Money spent", value: formatINR(spent), big: true },
    {
      label: "Classes attended",
      value: `${attended}`,
      sub: data.logs.length > attended ? `${data.logs.length - attended} missed` : "full house 💪",
    },
    {
      label: "Mood of the day",
      value: data.checkin?.mood ? MOOD_LABELS[data.checkin.mood] ?? "—" : "Not logged",
    },
    ...(topCategory
      ? [
          {
            label: "Best moment",
            value: `${CATEGORY_META[topCategory[0]].emoji} ${CATEGORY_META[topCategory[0]].label}`,
            sub: `${formatINR(topCategory[1])} — today's biggest spend`,
          },
        ]
      : []),
  ];

  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  return (
    <WrappedShell type="daily" title="Today, wrapped" subtitle={dateLabel} stats={stats} onClose={onClose} />
  );
}
