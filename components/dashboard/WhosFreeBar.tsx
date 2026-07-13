"use client";

import Link from "next/link";
import { Sparkles, ChevronRight } from "lucide-react";
import { useFriends } from "@/hooks/useFriends";
import { useRealtime } from "@/lib/realtime";

/** Broadcast bar — surfaces who's online to hang out right now. */
export function WhosFreeBar() {
  const friendsQuery = useFriends();
  const { onlineIds } = useRealtime();
  const friends = friendsQuery.data ?? [];
  const onlineCount = friends.filter((f) => onlineIds.has(f.id)).length;

  return (
    <Link
      href="/friends"
      className="clay mb-5 flex items-center gap-3 rounded-clay px-4 py-3.5"
    >
      <span className="clay-purple-btn flex size-10 shrink-0 items-center justify-center rounded-full">
        <Sparkles className="size-5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-extrabold text-ink">Who&apos;s free right now?</p>
        <p className="text-xs text-ink-dim">
          {onlineCount > 0
            ? `${onlineCount} ${onlineCount === 1 ? "friend" : "friends"} online — say hi 👋`
            : "See who's around campus"}
        </p>
      </div>
      {onlineCount > 0 && (
        <span className="flex items-center gap-1 rounded-full bg-clay-green-dim px-2.5 py-1 text-xs font-bold text-clay-green">
          <span className="size-1.5 rounded-full bg-clay-green" /> {onlineCount}
        </span>
      )}
      <ChevronRight className="size-4 shrink-0 text-ink-faint" />
    </Link>
  );
}
