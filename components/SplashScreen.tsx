"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ChevronUp, Users } from "lucide-react";
import { DockInLogo } from "@/components/auth/AuthCard";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useMyProfile, useTodayCheckin } from "@/hooks/useProfile";
import { useInboxSnaps } from "@/hooks/useSnaps";
import { useFriends } from "@/hooks/useFriends";
import { useRealtime } from "@/lib/realtime";
import { useAuthStore } from "@/store/authStore";

function moodEmoji(m: number | null | undefined): string {
  switch (m) {
    case 5:
      return "😄";
    case 4:
      return "🙂";
    case 3:
      return "😐";
    case 2:
      return "😕";
    case 1:
      return "😴";
    default:
      return "👋";
  }
}

/**
 * Social splash — full-screen clay avatar with today's mood, live friend
 * hints, and a swipe-up (or tap) to enter. Falls back to a simple logo
 * splash before the session is known (e.g. on the auth screens).
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const user = useAuthStore((s) => s.user);
  const name = useAuthStore((s) => s.displayName)();
  const profileQuery = useMyProfile();
  const checkinQuery = useTodayCheckin();
  const inboxQuery = useInboxSnaps();
  const friendsQuery = useFriends();
  const { onlineIds } = useRealtime();
  const [leaving, setLeaving] = useState(false);

  const leave = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onComplete, 380);
  };

  // Auto-dismiss fallback so the splash never traps anyone.
  useEffect(() => {
    const t = setTimeout(leave, user ? 3800 : 1300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const online = (friendsQuery.data ?? []).filter((f) => onlineIds.has(f.id)).length;
  const snaps = inboxQuery.data?.length ?? 0;
  const mood = checkinQuery.data?.mood ?? null;

  // Logged-out / pre-session → minimal logo splash.
  if (!user) {
    return (
      <AnimatePresence>
        {!leaving && (
          <motion.div
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.38 }}
            className="clay-page fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
          >
            <div className="clay-purple-btn grid size-[72px] place-items-center rounded-clay">
              <DockInLogo size={40} />
            </div>
            <p className="text-2xl font-black tracking-tight text-ink">DockIn</p>
            <p className="text-sm text-ink-dim">Bennett University</p>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.6, bottom: 0 }}
          onDragEnd={(_e, info) => {
            if (info.offset.y < -80) leave();
          }}
          onClick={leave}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ duration: 0.38 }}
          className="clay-page fixed inset-0 z-[9999] flex cursor-pointer flex-col items-center justify-center px-8"
        >
          {/* Avatar with mood */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 13, stiffness: 150 }}
            className="relative"
          >
            <div className="clay grid size-40 place-items-center rounded-full">
              <Avatar name={name} size={148} src={profileQuery.data?.avatar_url} showOnline={false} />
            </div>
            <span className="clay absolute -bottom-1 -right-1 grid size-14 place-items-center rounded-full text-3xl">
              {moodEmoji(mood)}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-7 text-2xl font-black tracking-tight text-ink"
          >
            Hey {name} 👋
          </motion.h1>

          {/* Friend activity hints */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
          >
            {online > 0 && (
              <span className="clay-soft flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-ink">
                <Users className="size-3.5 text-clay-green" /> {online} online
              </span>
            )}
            {snaps > 0 && (
              <span className="clay-soft flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-ink">
                <Camera className="size-3.5 text-clay-purple" /> {snaps} new snap{snaps > 1 ? "s" : ""}
              </span>
            )}
            {online === 0 && snaps === 0 && (
              <span className="text-sm text-ink-dim">Your campus, all in one place</span>
            )}
          </motion.div>

          {/* Swipe-up affordance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { delay: 0.6 }, y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } }}
            className="absolute bottom-[calc(env(safe-area-inset-bottom,0px)+40px)] flex flex-col items-center gap-1 text-ink-dim"
          >
            <ChevronUp className="size-6 text-clay-purple" strokeWidth={2.6} />
            <span className="text-xs font-semibold">Swipe up to enter</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
