"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { USER_STATS_COLUMNS } from "@/lib/supabase/columns";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useFriends } from "@/hooks/useFriends";
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

function activityLine(stats: UserStats | undefined, online: boolean): string {
  if (online) return "Online now";
  if (!stats) return "Joined Pulse";
  if (stats.steps_week > 0) return `Logged ${stats.steps_week.toLocaleString("en-IN")} steps this week`;
  if (stats.streak > 1) return `On a ${stats.streak}-day streak 🔥`;
  return `Pulse Score ${stats.pulse_score}`;
}

/** Dashboard "Friend Activity" section — real data from friends' stats + presence. */
export function FriendActivity() {
  const { data: friends } = useFriends();
  const { onlineIds } = useRealtime();

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
  const sorted = [...friends]
    .sort((a, b) => {
      const aOnline = onlineIds.has(a.id) ? 1 : 0;
      const bOnline = onlineIds.has(b.id) ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      const aTime = statsById.get(a.id)?.updated_at ?? "";
      const bTime = statsById.get(b.id)?.updated_at ?? "";
      return bTime.localeCompare(aTime);
    })
    .slice(0, 3);

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">
          Friend Activity
        </h2>
        <Link href="/friends" className="text-xs font-semibold text-primary hover:underline">
          See All
        </Link>
      </div>
      <Card className="divide-y divide-line/60">
        {sorted.map((friend) => {
          const s = statsById.get(friend.id);
          const online = onlineIds.has(friend.id);
          return (
            <Link
              key={friend.id}
              href={`/friends/${friend.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-card-hover transition-colors first:rounded-t-card last:rounded-b-card"
            >
              <Avatar
                name={friend.display_name ?? friend.username}
                userId={friend.id}
                size={38}
                src={friend.avatar_url}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {friend.display_name ?? friend.username}
                </p>
                <p className="text-[11px] text-ink-dim truncate">{activityLine(s, online)}</p>
              </div>
              <span className="text-[10px] text-ink-faint shrink-0">
                {online ? "" : s ? timeAgo(s.updated_at) : ""}
              </span>
            </Link>
          );
        })}
      </Card>
    </section>
  );
}
