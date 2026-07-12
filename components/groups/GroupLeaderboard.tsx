"use client";

import { useState } from "react";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGroupLeaderboard, type LeaderboardPeriod } from "@/hooks/useGroupLeaderboard";

const PERIODS: Array<{ id: LeaderboardPeriod; label: string }> = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

const RANK_BORDER: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

const RANK_TEXT: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

export function GroupLeaderboard({ groupId }: { groupId: string }) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("week");
  const leaderboardQuery = useGroupLeaderboard(groupId, period);
  const entries = leaderboardQuery.data ?? [];

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              period === p.id
                ? "bg-primary text-white"
                : "bg-card border border-line text-ink-dim"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {leaderboardQuery.isLoading ? (
        <RowSkeleton rows={4} />
      ) : entries.length === 0 ? (
        <EmptyState illustration="generic" title="No members yet" description="Invite friends to see the leaderboard." />
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const name = entry.profile?.display_name ?? entry.profile?.username ?? "Member";
            const displayName = entry.isYou ? `You (${name})` : name;
            const medal = RANK_BORDER[entry.rank];
            const scoreColor = entry.isYou ? "#6C63FF" : RANK_TEXT[entry.rank];

            return (
              <div
                key={entry.userId}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-card border ${
                  entry.isYou ? "bg-primary/10 border-primary/25" : "bg-card border-line"
                }`}
                style={medal ? { borderLeft: `3px solid ${medal}` } : undefined}
              >
                <div
                  className="h-7 w-7 rounded-full grid place-items-center shrink-0 text-[12px] font-bold"
                  style={{
                    background: medal ?? "rgb(var(--card-hover))",
                    color: medal ? "#000000" : "rgb(var(--ink-dim))",
                  }}
                >
                  {entry.rank}
                </div>

                <div className="h-11 w-11 rounded-full grid place-items-center shrink-0 text-[15px] font-bold text-white bg-gradient-to-br from-primary to-[#4FACFE] overflow-hidden">
                  {entry.profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-ink">{displayName}</p>
                  <p className="text-[11px] text-ink-dim">Pulse Score: {entry.score}</p>
                </div>

                <span className="text-lg font-black tabular-nums shrink-0" style={{ color: scoreColor ?? "rgb(var(--ink))" }}>
                  {entry.score}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
