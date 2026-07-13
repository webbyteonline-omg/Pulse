"use client";

import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useAuthStore } from "@/store/authStore";

const RANK_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

/**
 * Dashboard leaderboard preview — real data via useLeaderboard("pulse"),
 * which ranks the signed-in user + their friends by user_stats.pulse_score
 * (respecting each friend's privacy settings). No mock/placeholder data.
 */
export function LeaderboardCard() {
  const authUser = useAuthStore((s) => s.user);
  const { data, isLoading } = useLeaderboard("pulse");

  if (!authUser) return null;

  if (isLoading) {
    return (
      <div className="clay rounded-[20px] p-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span>🏆</span>
            <span className="font-bold text-[16px] text-ink">Leaderboard</span>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[52px] rounded-xl mb-1.5 bg-card-hover animate-pulse" />
        ))}
      </div>
    );
  }

  const entries = data ?? [];

  if (entries.length === 0) {
    return (
      <div
        className="rounded-[20px] p-4 mb-5 border border-primary/20"
        style={{
          background: "linear-gradient(145deg, rgb(var(--card)), rgb(var(--card-hover)))",
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span>🏆</span>
          <span className="font-bold text-[16px] text-ink">Leaderboard</span>
        </div>
        <p className="text-[13px] text-ink-dim py-3 text-center">
          Add friends to see how your Pulse Score compares.
        </p>
      </div>
    );
  }

  const ranked = entries.map((entry, i) => ({ ...entry, rank: i + 1 }));

  return (
    <div
      className="rounded-[20px] p-4 mb-5 border border-primary/20"
      style={{
        // Theme-aware base (rgb(var(--card))) tinted with the always-purple
        // brand accent — same "adapts + branded" pattern PulseScoreCard.tsx
        // uses, rather than a hardcoded dark-navy gradient that ignored
        // light theme entirely.
        background: "linear-gradient(145deg, rgb(var(--card)), rgb(var(--card-hover)))",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span>🏆</span>
          <span className="font-bold text-[16px] text-ink">Leaderboard</span>
        </div>
        <span className="text-[12px] text-ink-dim">This Week</span>
      </div>

      {ranked.map((entry) => {
        const name = entry.profile.display_name ?? entry.profile.username;
        const label = entry.isMe ? `You (${name})` : name;
        return (
          <div
            key={entry.profile.id}
            className={
              entry.isMe
                ? "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 bg-primary/15 border border-primary/30"
                : "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5 border border-transparent"
            }
          >
            <div
              className={
                RANK_COLORS[entry.rank]
                  ? "h-7 w-7 rounded-lg grid place-items-center shrink-0 text-[13px] font-bold text-black"
                  : "h-7 w-7 rounded-lg grid place-items-center shrink-0 text-[13px] font-bold bg-card-hover text-ink-dim"
              }
              style={RANK_COLORS[entry.rank] ? { background: RANK_COLORS[entry.rank] } : undefined}
            >
              {entry.rank}
            </div>

            <div
              className={
                entry.isMe
                  ? "h-9 w-9 rounded-full grid place-items-center shrink-0 text-[14px] font-bold text-white overflow-hidden"
                  : "h-9 w-9 rounded-full grid place-items-center shrink-0 text-[14px] font-bold text-ink bg-card-hover overflow-hidden"
              }
              style={entry.isMe ? { background: "linear-gradient(135deg, #6C63FF, #4FACFE)" } : undefined}
            >
              {entry.profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-[14px] truncate m-0 text-ink" style={{ fontWeight: entry.isMe ? 700 : 500 }}>
                {label}
              </p>
              <p className="text-[11px] m-0 text-ink-dim">Pulse Score: {entry.value}</p>
            </div>

            <div className="rounded-full px-3 py-1 shrink-0 bg-primary/20 border border-primary/40">
              <span className="text-[15px] font-bold text-primary">{entry.value}</span>
            </div>
          </div>
        );
      })}

      <p className="text-center text-[13px] mt-2 cursor-pointer text-primary">See Full Leaderboard</p>
    </div>
  );
}
