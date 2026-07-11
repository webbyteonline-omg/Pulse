"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { weekStartIST } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { UserProfile, UserStats } from "@/lib/supabase/types";

export type LeaderboardCategory = "steps" | "attendance" | "budget" | "pulse" | "mood";

export const LEADERBOARD_CATEGORIES: Array<{
  id: LeaderboardCategory;
  label: string;
  emoji: string;
  unit: string;
  privacyKey: keyof Pick<UserProfile, "privacy_steps" | "privacy_attendance" | "privacy_finance"> | null;
}> = [
  { id: "steps", label: "Steps", emoji: "👟", unit: "steps", privacyKey: "privacy_steps" },
  { id: "attendance", label: "Attendance", emoji: "📚", unit: "%", privacyKey: "privacy_attendance" },
  { id: "budget", label: "Budget left", emoji: "💰", unit: "%", privacyKey: "privacy_finance" },
  { id: "pulse", label: "Pulse Score", emoji: "🔥", unit: "pts", privacyKey: null },
  { id: "mood", label: "Mood", emoji: "😊", unit: "/5", privacyKey: "privacy_steps" },
];

export interface LeaderboardEntry {
  profile: UserProfile;
  stats: UserStats;
  value: number;
  isMe: boolean;
}

function valueFor(category: LeaderboardCategory, stats: UserStats): number | null {
  switch (category) {
    case "steps":
      return stats.week_start === weekStartIST() ? stats.steps_week : 0;
    case "attendance":
      return stats.attendance_pct !== null ? Number(stats.attendance_pct) : null;
    case "budget":
      return stats.budget_remaining_pct !== null ? Number(stats.budget_remaining_pct) : null;
    case "pulse":
      return stats.pulse_score;
    case "mood":
      return stats.mood_avg_week !== null && stats.week_start === weekStartIST()
        ? Number(stats.mood_avg_week)
        : null;
  }
}

/** Me + friends ranked per category, privacy respected. */
export function useLeaderboard(category: LeaderboardCategory) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["leaderboard", category],
    enabled: !!user,
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      const supabase = getSupabaseBrowser();
      const { data: friendRows } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", user!.id);
      const ids = [user!.id, ...(friendRows ?? []).map((r) => r.friend_id)];

      const [{ data: profiles }, { data: stats }] = await Promise.all([
        supabase.from("user_profiles").select("*").in("id", ids),
        supabase.from("user_stats").select("*").in("user_id", ids),
      ]);
      const statsById = new Map((stats ?? []).map((s) => [s.user_id, s]));
      const meta = LEADERBOARD_CATEGORIES.find((c) => c.id === category);

      const entries: LeaderboardEntry[] = [];
      for (const profile of profiles ?? []) {
        const s = statsById.get(profile.id);
        if (!s) continue;
        // Privacy: skip friends who don't share this stat (always include self)
        if (profile.id !== user!.id && meta?.privacyKey && !profile[meta.privacyKey]) continue;
        const value = valueFor(category, s);
        if (value === null) continue;
        entries.push({ profile, stats: s, value, isMe: profile.id === user!.id });
      }
      return entries.sort((a, b) => b.value - a.value);
    },
  });
}

/** Last week's champion for the header banner. */
export function useLastWeekChampion(category: LeaderboardCategory) {
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["leaderboard", "champion", category],
    enabled: !!user,
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const lastWeek = new Date(weekStartIST());
      lastWeek.setUTCDate(lastWeek.getUTCDate() - 7);
      const { data } = await supabase
        .from("leaderboard_history")
        .select("*")
        .eq("week_start", lastWeek.toISOString().slice(0, 10))
        .eq("category", category)
        .limit(1);
      const row = data?.[0];
      if (!row) return null;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", row.user_id)
        .maybeSingle();
      return profile ? { profile, value: row.value !== null ? Number(row.value) : null } : null;
    },
  });
}
