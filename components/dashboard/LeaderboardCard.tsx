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
      className="rounded-[20px] p-4 mb-5"
      style={{
        background: "linear-gradient(145deg, #1A1A2E, #16213E)",
        border: "1px solid rgba(108,99,255,0.2)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span>🏆</span>
          <span className="font-bold text-[16px]" style={{ color: "#FFFFFF" }}>
            Leaderboard
          </span>
        </div>
        <span className="text-[12px]" style={{ color: "#8888A8" }}>
          This Week
        </span>
      </div>

      {entries.map((entry) => (
        <div
          key={entry.rank}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1.5"
          style={{
            background: entry.isYou ? "rgba(108,99,255,0.15)" : "transparent",
            border: entry.isYou ? "1px solid rgba(108,99,255,0.3)" : "1px solid transparent",
          }}
        >
          <div
            className="h-7 w-7 rounded-lg grid place-items-center shrink-0 text-[13px] font-bold"
            style={{
              background: RANK_COLORS[entry.rank] ?? "#2A2A3E",
              color: entry.rank <= 3 ? "#000000" : "#8888A8",
            }}
          >
            {entry.rank}
          </div>

          <div
            className="h-9 w-9 rounded-full grid place-items-center shrink-0 text-[14px] font-bold text-white"
            style={{
              background: entry.isYou ? "linear-gradient(135deg, #6C63FF, #4FACFE)" : "#2A2A3E",
            }}
          >
            {entry.name.replace("You (", "").charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-[14px] truncate m-0"
              style={{ color: "#FFFFFF", fontWeight: entry.isYou ? 700 : 500 }}
            >
              {entry.name}
            </p>
            <p className="text-[11px] m-0" style={{ color: "#8888A8" }}>
              Pulse Score: {entry.score}
            </p>
          </div>

          <div
            className="rounded-full px-3 py-1 shrink-0"
            style={{ background: "rgba(108,99,255,0.2)", border: "1px solid rgba(108,99,255,0.4)" }}
          >
            <span className="text-[15px] font-bold" style={{ color: "#6C63FF" }}>
              {entry.score}
            </span>
          </div>
        </div>
      ))}

      <p className="text-center text-[13px] mt-2 cursor-pointer" style={{ color: "#6C63FF" }}>
        See Full Leaderboard
      </p>
    </div>
  );
}
