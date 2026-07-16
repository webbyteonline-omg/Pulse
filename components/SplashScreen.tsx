"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronUp } from "lucide-react";
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

function moodText(m: number | null | undefined): string {
  switch (m) {
    case 5:
      return "on top of the world";
    case 4:
      return "vibing today";
    case 3:
      return "meh, surviving";
    case 2:
      return "kinda done tbh";
    case 1:
      return "buried in assignments";
    default:
      return "living my best life";
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
          className="fixed inset-0 z-[9999] flex cursor-pointer flex-col items-center overflow-hidden bg-[radial-gradient(120%_80%_at_50%_0%,#2a1a3d_0%,#0d0714_55%,#0a0610_100%)] px-6 pt-16"
        >
          {/* Top pills */}
          <div className="flex w-full flex-col items-start gap-2.5">
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="genz-gradient rounded-full px-4 py-2 text-xs font-bold text-white shadow-lg"
            >
              {moodEmoji(mood)} Mood: {moodText(mood)}
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#0F0A1E] shadow-lg"
            >
              <span className="size-2 rounded-full bg-success" /> {online} online · {snaps} new snap{snaps === 1 ? "" : "s"}
            </motion.span>
          </div>

          {/* Floating avatar */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -10, 0],
            }}
            transition={{
              scale: { type: "spring", damping: 13, stiffness: 150 },
              opacity: { duration: 0.4 },
              y: { repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.6 },
            }}
            className="relative mt-16 shrink-0"
          >
            <div className="genz-gradient grid size-40 place-items-center rounded-full p-1 shadow-2xl">
              <div className="grid size-full place-items-center rounded-full bg-[#0d0714]">
                <Avatar name={name} size={148} src={profileQuery.data?.avatar_url} showOnline={false} />
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 grid size-12 place-items-center rounded-full bg-white text-2xl shadow-lg">
              {moodEmoji(mood)}
            </span>
          </motion.div>

          {/* Spacer pushes hero text toward bottom third like reference */}
          <div className="flex-1" />

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-2 w-full"
          >
            <p className="text-lg font-bold text-white/70">Hey, {name}</p>
            <h1 className="text-[42px] font-extrabold leading-[0.95] tracking-tight text-white">
              Dock <span className="genz-gradient-text">in.</span>
            </h1>
            <p className="mt-2 italic text-sm text-white/60">ur bestie&apos;s already here</p>
          </motion.div>

          {/* Swipe-up affordance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { delay: 0.6 }, y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" } }}
            className="mb-[calc(env(safe-area-inset-bottom,0px)+28px)] flex flex-col items-center gap-1 text-white/70"
          >
            <ChevronUp className="size-5" strokeWidth={2.6} />
            <span className="text-xs font-semibold">Swipe up to enter</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
