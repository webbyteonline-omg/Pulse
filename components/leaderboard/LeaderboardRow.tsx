"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { Avatar } from "@/components/friends/OnlineIndicator";
import type { LeaderboardEntry } from "@/hooks/useLeaderboard";

const MEDAL_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];

export function LeaderboardRow({
  entry,
  rank,
  unit,
  index,
}: {
  entry: LeaderboardEntry;
  rank: number;
  unit: string;
  index: number;
}) {
  const medal = rank <= 3 ? MEDAL_COLORS[rank - 1] : null;
  const name = entry.profile.display_name ?? entry.profile.username;
  const valueLabel =
    unit === "%" || unit === "/5"
      ? `${Number(entry.value).toFixed(1)}${unit}`
      : `${Math.round(entry.value).toLocaleString("en-IN")} ${unit}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(0.3, 0.05 * index) }}
      className={`flex items-center gap-3 rounded-card border p-3.5 ${
        entry.isMe ? "border-primary/50 bg-primary/[0.06]" : "border-line bg-card"
      }`}
    >
      <div className="w-8 text-center shrink-0">
        {medal ? (
          <Crown className="h-5 w-5 mx-auto" style={{ color: medal }} fill={medal} />
        ) : (
          <span className="text-sm font-black text-ink-faint tabular-nums">{rank}</span>
        )}
      </div>
      <Link href={entry.isMe ? "/profile" : `/friends/${entry.profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar name={name} userId={entry.profile.id} size={36} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">
            {name}
            {entry.isMe && <span className="text-primary"> (you)</span>}
          </p>
          <p className="text-[11px] text-ink-dim">@{entry.profile.username}</p>
        </div>
      </Link>
      <span className="text-sm font-bold tabular-nums shrink-0">{valueLabel}</span>
    </motion.div>
  );
}
