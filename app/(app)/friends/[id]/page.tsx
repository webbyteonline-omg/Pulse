"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Footprints, GraduationCap, MapPin, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar, OnlineIndicator } from "@/components/friends/OnlineIndicator";
import { useFriendProfile, useFriends, useUnfriend } from "@/hooks/useFriends";
import { useIsOnline } from "@/lib/realtime";
import { scoreColor } from "@/lib/pulseScore";
import { todayIST } from "@/lib/utils";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

function useFriendTodaySteps(friendId: string, allowed: boolean) {
  return useQuery({
    queryKey: ["friend-steps", friendId],
    enabled: allowed,
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from("daily_checkins")
        .select("id,user_id,date,mood,steps,created_at")
        .eq("user_id", friendId)
        .eq("date", todayIST())
        .maybeSingle();
      return data;
    },
  });
}

export default function FriendProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const profileQuery = useFriendProfile(id);
  const { data: friends } = useFriends();
  const unfriend = useUnfriend();
  const online = useIsOnline(id);
  const [confirmUnfriend, setConfirmUnfriend] = useState(false);

  const isFriend = (friends ?? []).some((f) => f.id === id);
  const profile = profileQuery.data?.profile;
  const stats = profileQuery.data?.stats;
  const location = profileQuery.data?.location;
  const scores = profileQuery.data?.scores ?? [];
  const stepsQuery = useFriendTodaySteps(id, isFriend && !!profile?.privacy_steps);

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full rounded-card" />
        <Skeleton className="h-24 w-full rounded-card" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-dim">Profile not found or private.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push("/friends")}>
          Back to friends
        </Button>
      </div>
    );
  }

  const name = profile.display_name ?? profile.username;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push("/friends")}
          aria-label="Back"
          className="p-2 -ml-2 min-h-[44px] min-w-[44px] rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold truncate">{name}</h1>
        {isFriend && (
          <Button variant="danger" size="sm" onClick={() => setConfirmUnfriend(true)}>
            <UserMinus className="h-3.5 w-3.5" /> Unfriend
          </Button>
        )}
      </div>

      {/* Profile card */}
      <Card gradient className="p-6 mb-4 text-center">
        <div className="flex justify-center">
          <Avatar name={name} userId={id} size={72} />
        </div>
        <h2 className="mt-3 text-lg font-bold">{name}</h2>
        <p className="text-sm text-ink-dim">
          @{profile.username} ·{" "}
          <span className={online ? "text-success" : "text-ink-faint"}>
            {online ? "online now" : "offline"}
          </span>
        </p>
        <motion.p
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14 }}
          className="mt-4 text-5xl font-black tabular-nums"
          style={{ color: scoreColor(profile.pulse_score) }}
        >
          {profile.pulse_score}
        </motion.p>
        <p className="text-[11px] text-ink-dim font-bold uppercase tracking-widest mt-1">
          Pulse Score
        </p>
      </Card>

      {!isFriend ? (
        <Card className="p-5 text-center">
          <p className="text-sm text-ink-dim">
            Add {name} as a friend to see their stats.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {profile.privacy_attendance && stats?.attendance_pct !== null && stats?.attendance_pct !== undefined && (
            <Card className="p-4">
              <div className="flex items-center gap-1.5 text-xs text-ink-dim font-medium">
                <GraduationCap className="h-3.5 w-3.5" /> Attendance
              </div>
              <p className="mt-1.5 text-xl font-bold">{Number(stats.attendance_pct).toFixed(1)}%</p>
            </Card>
          )}
          {profile.privacy_steps && (
            <Card className="p-4">
              <div className="flex items-center gap-1.5 text-xs text-ink-dim font-medium">
                <Footprints className="h-3.5 w-3.5" /> Steps today
              </div>
              <p className="mt-1.5 text-xl font-bold">
                {stepsQuery.data?.steps?.toLocaleString("en-IN") ?? "—"}
              </p>
            </Card>
          )}
          {profile.privacy_location && (
            <Card className="p-4">
              <div className="flex items-center gap-1.5 text-xs text-ink-dim font-medium">
                <MapPin className="h-3.5 w-3.5" /> Location
              </div>
              <p className="mt-1.5 text-xl font-bold">
                {location?.area === "campus"
                  ? "In Campus"
                  : location?.area === "outside"
                    ? "Outside Campus"
                    : "—"}
              </p>
            </Card>
          )}
          <Card className="p-4">
            <div className="flex items-center gap-1.5 text-xs text-ink-dim font-medium">
              <OnlineIndicator userId={id} size={8} /> Streak
            </div>
            <p className="mt-1.5 text-xl font-bold">{stats?.streak ?? 0} days</p>
          </Card>
        </div>
      )}

      {/* Score trend */}
      {isFriend && scores.length > 1 && (
        <Card className="p-4 mt-4">
          <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-3">
            Score trend
          </h3>
          <div className="flex items-end gap-1 h-20">
            {[...scores].reverse().map((s) => (
              <div
                key={s.id}
                className="flex-1 rounded-t"
                title={`${s.date}: ${s.score}`}
                style={{
                  height: `${Math.max(4, s.score)}%`,
                  backgroundColor: scoreColor(s.score),
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        </Card>
      )}

      <Modal open={confirmUnfriend} onClose={() => setConfirmUnfriend(false)} title="Unfriend?" variant="center">
        <p className="text-sm text-ink-dim">
          Remove <span className="font-semibold text-ink">{name}</span> from your friends?
          They won&apos;t be notified.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setConfirmUnfriend(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            loading={unfriend.isPending}
            onClick={async () => {
              await unfriend.mutateAsync(id);
              router.push("/friends");
            }}
          >
            Unfriend
          </Button>
        </div>
      </Modal>
    </div>
  );
}
