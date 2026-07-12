"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Crown, Footprints, MapPin, Vote } from "lucide-react";
import { Avatar } from "./OnlineIndicator";
import { Card } from "@/components/ui/Card";
import { useFriends } from "@/hooks/useFriends";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useRealtime } from "@/lib/realtime";
import { useAuthStore } from "@/store/authStore";

const MEDALS = ["#FFD700", "#C0C0C0", "#CD7F32"];

/** Friends "Overview" tab — avatar activity rail, streak card, quick actions, leaderboard preview. */
export function FriendsOverview() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: friends } = useFriends();
  const { onlineIds } = useRealtime();
  const leaderboard = useLeaderboard("pulse");

  const { data: myStats } = useQuery({
    queryKey: ["my-streak"],
    enabled: !!user,
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from("user_stats")
        .select("streak,pulse_score")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  if (!friends || friends.length === 0) return null;

  const quickActions = [
    { label: "Share Location", color: "#43D98C", icon: MapPin, href: "/map" },
    { label: "Share Steps", color: "#4FACFE", icon: Footprints, href: "/health" },
    { label: "Create Poll", color: "#FF5C5C", icon: Vote, href: "/polls?create=1" },
    { label: "Leaderboard", color: "#6C63FF", icon: Crown, href: "/leaderboard" },
  ];

  const top = (leaderboard.data ?? []).slice(0, 4);

  return (
    <div className="mb-6 space-y-6">
      {/* Activity avatar rail */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Friend Activity</h2>
          <Link href="/friends" className="text-xs font-semibold text-primary">View All</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
          {friends.slice(0, 10).map((f) => {
            const online = onlineIds.has(f.id);
            return (
              <Link key={f.id} href={`/friends/${f.id}`} className="flex flex-col items-center gap-1 shrink-0 w-16">
                <span className={`rounded-full p-0.5 ${online ? "ring-2 ring-success" : "ring-2 ring-line"}`}>
                  <Avatar name={f.display_name ?? f.username} userId={f.id} size={52} src={f.avatar_url} />
                </span>
                <span className="text-[11px] font-semibold truncate w-full text-center">
                  {(f.display_name ?? f.username).split(" ")[0]}
                </span>
                <span className={`text-[9px] font-bold ${online ? "text-success" : "text-ink-faint"}`}>
                  {online ? "Online" : "Away"}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Study streak gradient card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-hero p-5 bg-pulse-gradient text-white"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-base font-black">Friends Study Streak 🔥</p>
            <p className="text-xs opacity-85 mt-0.5">Keep the streak going!</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tabular-nums leading-none">{myStats?.streak ?? 0}</p>
            <p className="text-[10px] font-bold opacity-85">days</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2 items-center">
            {friends.slice(0, 4).map((f) => (
              <span key={f.id} className="rounded-full ring-2 ring-white/40">
                <Avatar name={f.display_name ?? f.username} size={28} showOnline={false} src={f.avatar_url} />
              </span>
            ))}
            {friends.length > 4 && (
              <span className="grid place-items-center h-7 w-7 rounded-full bg-white/25 text-[10px] font-black ml-1">
                +{friends.length - 4}
              </span>
            )}
          </div>
          <button
            onClick={() => router.push("/leaderboard")}
            className="px-3.5 py-2 rounded-full bg-white/20 text-xs font-bold"
          >
            View Leaderboard →
          </button>
        </div>
      </motion.div>

      {/* Quick actions */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-2">
          {quickActions.map((a) => (
            <Link key={a.label} href={a.href} className="flex flex-col items-center gap-1.5 bg-card border border-line rounded-card py-3 px-1">
              <span className="grid place-items-center h-10 w-10 rounded-full" style={{ backgroundColor: `${a.color}22` }}>
                <a.icon className="h-4.5 w-4.5" style={{ color: a.color, height: 18, width: 18 }} />
              </span>
              <span className="text-[9.5px] font-bold text-center leading-tight text-ink-dim">{a.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Leaderboard preview */}
      {top.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Friend Leaderboard</h2>
            <Link href="/leaderboard" className="text-xs font-semibold text-primary">This Week</Link>
          </div>
          <Card className="divide-y divide-line/60">
            {top.map((entry, i) => (
              <div
                key={entry.profile.id}
                className={`flex items-center gap-3 px-4 py-3 ${entry.isMe ? "bg-primary/[0.07]" : ""} first:rounded-t-card last:rounded-b-card`}
              >
                <span className="w-6 text-center">
                  {i < 3 ? (
                    <Crown className="h-4.5 w-4.5 mx-auto" style={{ color: MEDALS[i], height: 18, width: 18 }} fill={MEDALS[i]} />
                  ) : (
                    <span className="text-xs font-black text-ink-faint">{i + 1}</span>
                  )}
                </span>
                <Avatar name={entry.profile.display_name ?? entry.profile.username} size={34} src={entry.profile.avatar_url} userId={entry.profile.id} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {entry.profile.display_name ?? entry.profile.username}
                    {entry.isMe && <span className="text-primary"> (you)</span>}
                  </p>
                  <p className="text-[10px] text-ink-dim">Pulse Score: {entry.stats.pulse_score}</p>
                </div>
                <span className="text-sm font-black text-primary tabular-nums">💎 {entry.stats.pulse_score * 10}</span>
              </div>
            ))}
          </Card>
        </section>
      )}
    </div>
  );
}
