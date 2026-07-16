"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { USER_STATS_COLUMNS } from "@/lib/supabase/columns";
import { useFriends } from "@/hooks/useFriends";
import { useFriendLocations } from "@/hooks/useFriendLocations";
import { useRealtime } from "@/lib/realtime";
import type { UserStats } from "@/lib/supabase/types";

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function activityLine(stats: UserStats | undefined, online: boolean, onCampus: boolean): string {
  if (online && onCampus) return "on campus rn";
  if (online) return "online now";
  if (!stats) return "just joined DockIn";
  if (stats.streak > 1) return `on a ${stats.streak}-day streak 🔥`;
  return "around campus";
}

/** Dashboard "Friend Activity" section — real presence + campus location, no fabricated data. */
export function FriendActivity() {
  const { data: friends } = useFriends();
  const { onlineIds } = useRealtime();
  const { data: locations } = useFriendLocations();

  const ids = (friends ?? []).map((f) => f.id);
  const { data: stats } = useQuery({
    queryKey: ["friend-activity", ids],
    enabled: ids.length > 0,
    queryFn: async (): Promise<UserStats[]> => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from("user_stats")
        .select(USER_STATS_COLUMNS)
        .in("user_id", ids)
        .order("updated_at", { ascending: false })
        .limit(5);
      return (data ?? []) as UserStats[];
    },
  });

  if (!friends || friends.length === 0) return null;

  const statsById = new Map((stats ?? []).map((s) => [s.user_id, s]));
  const locationById = new Map((locations ?? []).map((l) => [l.userId, l]));
  const sorted = [...friends]
    .sort((a, b) => {
      const aOnline = onlineIds.has(a.id) ? 1 : 0;
      const bOnline = onlineIds.has(b.id) ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      const aTime = statsById.get(a.id)?.updated_at ?? "";
      const bTime = statsById.get(b.id)?.updated_at ?? "";
      return bTime.localeCompare(aTime);
    })
    .slice(0, 4);

  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">Friends Live</h2>
        <Link href="/friends" className="text-xs font-semibold text-primary hover:underline">
          See All
        </Link>
      </div>
      <div className="space-y-2.5">
        {sorted.map((friend) => {
          const s = statsById.get(friend.id);
          const online = onlineIds.has(friend.id);
          const loc = locationById.get(friend.id);
          const onCampus = loc?.area === "campus";
          return (
            <Link key={friend.id} href={`/friends/${friend.id}`} className="flex items-center gap-2 text-sm">
              <span
                className={`size-2 shrink-0 rounded-full ${online ? "bg-success" : "bg-ink-faint/40"}`}
              />
              <span className="font-semibold text-ink">{friend.display_name ?? friend.username}</span>
              <span className="truncate text-ink-dim">
                {" "}
                is {activityLine(s, online, onCampus)}
              </span>
              {!online && s && (
                <span className="ml-auto shrink-0 text-[10px] text-ink-faint">{timeAgo(s.updated_at)}</span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
