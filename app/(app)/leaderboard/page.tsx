"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Crown, Timer } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SOCIAL_TABS, SubTabs } from "@/components/layout/SubTabs";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { LeaderboardRow } from "@/components/leaderboard/LeaderboardRow";
import {
  LEADERBOARD_CATEGORIES,
  useLastWeekChampion,
  useLeaderboard,
  type LeaderboardCategory,
} from "@/hooks/useLeaderboard";
import { weekStartIST } from "@/lib/utils";

/** ms until next Monday 00:00 IST. */
function msToReset(): number {
  const [y, m, d] = weekStartIST().split("-").map(Number);
  const nextMonday = Date.UTC(y ?? 2026, (m ?? 1) - 1, (d ?? 1) + 7) - 5.5 * 3_600_000;
  return Math.max(0, nextMonday - Date.now());
}

function Countdown() {
  const [ms, setMs] = useState(msToReset());
  useEffect(() => {
    const t = setInterval(() => setMs(msToReset()), 60_000);
    return () => clearInterval(t);
  }, []);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return (
    <span className="flex items-center gap-1 text-[11px] font-bold text-ink-dim">
      <Timer className="h-3.5 w-3.5" />
      resets in {days > 0 ? `${days}d ` : ""}{hours}h
    </span>
  );
}

export default function LeaderboardPage() {
  const [category, setCategory] = useState<LeaderboardCategory>("pulse");
  const leaderboardQuery = useLeaderboard(category);
  const championQuery = useLastWeekChampion(category);

  const entries = leaderboardQuery.data ?? [];
  const meta = LEADERBOARD_CATEGORIES.find((c) => c.id === category);
  const champion = championQuery.data;

  return (
    <div>
      <Header title="Leaderboard" subtitle="Weekly race with your friends" />
      <SubTabs tabs={SOCIAL_TABS} layoutId="social-tabs" />

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mb-4">
        {LEADERBOARD_CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`shrink-0 min-h-[44px] px-3.5 rounded-full text-xs font-bold border transition-colors ${
              category === c.id
                ? "bg-primary-dim border-primary text-primary"
                : "border-line text-ink-dim"
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">
          {meta?.emoji} {meta?.label}
        </h2>
        <Countdown />
      </div>

      {/* Last week's champion */}
      {champion && (
        <Card className="p-3.5 mb-4 flex items-center gap-2.5 border-warning/40">
          <Crown className="h-5 w-5 text-warning shrink-0" fill="#FFB347" />
          <p className="text-sm">
            <span className="text-ink-dim">Last week&apos;s champion: </span>
            <span className="font-bold">
              {champion.profile.display_name ?? champion.profile.username}
            </span>
            {champion.value !== null && (
              <span className="text-ink-dim">
                {" — "}
                {Math.round(champion.value).toLocaleString("en-IN")} {meta?.unit} 👑
              </span>
            )}
          </p>
        </Card>
      )}

      {leaderboardQuery.isLoading ? (
        <RowSkeleton rows={4} />
      ) : entries.length === 0 ? (
        <EmptyState
          illustration="generic"
          title="Nobody on the board yet"
          description="Add friends and log your daily check-in — rankings appear as soon as there's data to compare. Friends only appear for stats they've chosen to share."
        />
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {entries.map((entry, i) => (
              <LeaderboardRow
                key={entry.profile.id}
                entry={entry}
                rank={i + 1}
                unit={meta?.unit ?? ""}
                index={i}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <p className="mt-4 text-center text-[11px] text-ink-faint">
        Only friends who share a stat appear in that category. Resets Monday midnight IST.
      </p>
    </div>
  );
}
