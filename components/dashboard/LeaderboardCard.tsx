"use client";

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isYou?: boolean;
}

const MOCK_PEERS: Array<{ name: string; score: number }> = [
  { name: "Anshika", score: 97 },
  { name: "Rohit", score: 93 },
  { name: "Karan", score: 89 },
  { name: "Priya", score: 87 },
];

const RANK_COLORS: Record<number, string> = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
};

export interface LeaderboardCardProps {
  /** Real display name of the signed-in user, from useMyProfile(). */
  yourName: string;
  /** Real Pulse Score of the signed-in user. */
  yourScore: number;
}

/**
 * Dashboard leaderboard preview — uses MOCK peer data (no real friends
 * leaderboard backend yet) but slots the actual logged-in user's name and
 * live Pulse Score into the ranking so "You" is always accurate.
 */
export function LeaderboardCard({ yourName, yourScore }: LeaderboardCardProps) {
  const entries: LeaderboardEntry[] = [...MOCK_PEERS, { name: `You (${yourName})`, score: yourScore, isYou: true }]
    .sort((a, b) => b.score - a.score)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));

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

      {entries.map((entry) => (
        <div
          key={entry.rank}
          className={
            entry.isYou
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
              entry.isYou
                ? "h-9 w-9 rounded-full grid place-items-center shrink-0 text-[14px] font-bold text-white"
                : "h-9 w-9 rounded-full grid place-items-center shrink-0 text-[14px] font-bold text-ink bg-card-hover"
            }
            style={
              entry.isYou ? { background: "linear-gradient(135deg, #6C63FF, #4FACFE)" } : undefined
            }
          >
            {entry.name.replace("You (", "").charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-[14px] truncate m-0 text-ink"
              style={{ fontWeight: entry.isYou ? 700 : 500 }}
            >
              {entry.name}
            </p>
            <p className="text-[11px] m-0 text-ink-dim">Pulse Score: {entry.score}</p>
          </div>

          <div className="rounded-full px-3 py-1 shrink-0 bg-primary/20 border border-primary/40">
            <span className="text-[15px] font-bold text-primary">{entry.score}</span>
          </div>
        </div>
      ))}

      <p className="text-center text-[13px] mt-2 cursor-pointer text-primary">
        See Full Leaderboard
      </p>
    </div>
  );
}
