"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  BookOpen,
  CalendarClock,
  ChevronRight,
  Crown,
  HelpCircle,
  ListChecks,
  Lock,
  Map,
  MessageSquare,
  Pencil,
  Settings,
  Sparkles,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { useFriends } from "@/hooks/useFriends";
import { useMyProfile } from "@/hooks/useProfile";
import { useSentSnapCount } from "@/hooks/useSnaps";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/authStore";

const ACCOUNT_LINKS = [
  { href: "/settings", label: "Edit Profile", desc: "Name, username & avatar", icon: UserRound },
  { href: "/settings", label: "Preferences", desc: "Theme, attendance defaults", icon: Settings },
  { href: "/settings#notifications", label: "Notifications", desc: "Push & email reminders", icon: Bell },
  { href: "/settings#privacy", label: "Privacy & Security", desc: "Sharing, encryption keys", icon: Lock },
];

const MORE_LINKS = [
  { href: "/chats", label: "Chats", icon: MessageSquare },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/profile/wrapped", label: "Wrapped", icon: Sparkles },
  { href: "/profile/pulse-score", label: "Pulse Score", icon: Zap },
  { href: "/profile/activity", label: "My Activity", icon: ListChecks },
  { href: "/map", label: "Campus Map", icon: Map },
  { href: "/academic", label: "Academic Calendar", icon: CalendarClock },
];

const BADGES = [
  { emoji: "🌅", label: "Early Bird", color: "#FB923C" },
  { emoji: "🍽️", label: "Mess MVP", color: "#F43F5E" },
  { emoji: "🦉", label: "Night Owl", color: "#7C3AED" },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName)();
  const profileQuery = useMyProfile();
  const friendsQuery = useFriends();
  const snapCountQuery = useSentSnapCount();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: myStats } = useQuery({
    queryKey: ["my-streak"],
    enabled: !!user,
    queryFn: async () => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase
        .from("user_stats")
        .select("streak")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const profile = profileQuery.data;
  const friendCount = (friendsQuery.data ?? []).length;
  const streak = myStats?.streak ?? 0;
  const level = Math.max(1, Math.floor((profile?.pulse_score ?? 0) / 8));

  const share = async () => {
    const data = {
      title: "DockIn",
      text: "College life, one screen — attendance, money, friends & more. Join me on DockIn!",
      url: window.location.origin,
    };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard.writeText(data.url).catch(() => undefined);
  };

  return (
    <div>
      {/* Full-bleed gradient hero */}
      <div className="relative -mx-4 -mt-4 overflow-hidden bg-genz-hero px-4 pb-14 pt-4 text-white md:-mx-8">
        <div className="flex items-center justify-between">
          <span aria-hidden className="text-lg">✨</span>
          <Link
            href="/settings"
            className="rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-ink"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Avatar overlapping hero */}
      <div className="-mt-10 mb-4 flex items-end gap-3 px-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setPickerOpen(true)}
          aria-label="Change avatar"
          className="relative shrink-0"
        >
          <span className="block rounded-full border-[4px] border-bg">
            <Avatar name={displayName} userId={user?.id} size={80} src={profile?.avatar_url} />
          </span>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2 py-0.5 text-[9px] font-black text-white">
            Lvl {level}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center h-6 w-6 rounded-full genz-gradient-btn border-2 border-bg">
            <Pencil className="h-3 w-3" />
          </span>
        </motion.button>
        <div className="min-w-0 flex-1 pb-1">
          <h2 className="text-xl font-extrabold truncate text-ink">{displayName}</h2>
          <p className="truncate text-xs text-ink-dim">@{profile?.username ?? "you"} · {user?.email}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="genz-gradient rounded-card p-3.5 flex flex-col items-center text-center text-white"
        >
          <p className="text-lg font-black tabular-nums leading-tight">{streak}</p>
          <p className="text-[10px] font-semibold">Streak</p>
          <p className="text-[9px] italic opacity-85">{streak > 0 ? "on fire" : "start today"}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="clay rounded-card p-3.5 flex flex-col items-center text-center"
        >
          <p className="text-lg font-black tabular-nums leading-tight text-ink">{friendCount}</p>
          <p className="text-[10px] text-ink-dim font-semibold">Friends</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="clay rounded-card p-3.5 flex flex-col items-center text-center"
        >
          <p className="text-lg font-black tabular-nums leading-tight text-ink">{snapCountQuery.data ?? 0}</p>
          <p className="text-[10px] text-ink-dim font-semibold">Snaps</p>
        </motion.div>
      </div>

      {/* Badges row */}
      <div className="mb-5 flex gap-4">
        {BADGES.map((b) => (
          <div key={b.label} className="flex flex-col items-center gap-1.5">
            <span
              className="grid size-11 place-items-center rounded-full text-xl"
              style={{ backgroundColor: b.color }}
            >
              {b.emoji}
            </span>
            <span className="text-center text-[10px] font-semibold leading-tight text-ink-dim">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Quick access — academics + settings only */}
      <div className="mb-5 grid grid-cols-2 gap-2.5">
        {[
          { href: "/academic", label: "Academics", icon: BookOpen, color: "#7C3AED" },
          { href: "/settings", label: "Settings", icon: Settings, color: "#FB923C" },
        ].map((q) => (
          <Link key={q.label} href={q.href} className="clay flex flex-col items-center gap-1.5 rounded-card py-3.5">
            <q.icon className="size-5" style={{ color: q.color }} />
            <span className="text-[10px] font-bold text-ink-dim">{q.label}</span>
          </Link>
        ))}
      </div>

      {/* Invite card */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => void share()}
        className="w-full text-left relative overflow-hidden rounded-hero p-5 mb-5 bg-genz-hero text-white"
      >
        <div aria-hidden className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-11 w-11 rounded-full bg-white/20 shrink-0">
            <Crown className="h-5 w-5" fill="#fff" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-black">Bring your squad to DockIn</p>
            <p className="text-xs opacity-85 mt-0.5">Snaps, streaks & chaos are better with friends</p>
          </div>
          <span className="px-3.5 py-2 rounded-full bg-white text-primary text-xs font-black shrink-0">Invite</span>
        </div>
      </motion.button>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {MORE_LINKS.map((l) => (
          <Link key={l.label} href={l.href} className="flex flex-col items-center gap-1.5 clay rounded-card py-3">
            <l.icon className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-bold text-ink-dim">{l.label}</span>
          </Link>
        ))}
      </div>

      {/* Account */}
      <h2 className="text-lg font-semibold mb-3">Account</h2>
      <Card className="divide-y divide-line/60 mb-5">
        {ACCOUNT_LINKS.map((l) => (
          <Link key={l.label} href={l.href} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-card-hover transition-colors first:rounded-t-card last:rounded-b-card">
            <span className="grid place-items-center h-10 w-10 rounded-btn bg-primary-dim shrink-0">
              <l.icon className="h-4.5 w-4.5 text-primary" style={{ height: 18, width: 18 }} />
            </span>
            <span className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{l.label}</p>
              <p className="text-[11px] text-ink-dim truncate">{l.desc}</p>
            </span>
            <ChevronRight className="h-4 w-4 text-ink-faint shrink-0" />
          </Link>
        ))}
      </Card>

      {/* Support */}
      <h2 className="text-lg font-semibold mb-3">Support</h2>
      <Card className="divide-y divide-line/60">
        <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-3.5 px-4 py-3.5 first:rounded-t-card">
          <span className="grid place-items-center h-10 w-10 rounded-btn bg-sky-dim shrink-0">
            <HelpCircle style={{ height: 18, width: 18, color: "#4FACFE" }} />
          </span>
          <span className="flex-1 text-sm font-semibold">Help Center</span>
          <ChevronRight className="h-4 w-4 text-ink-faint" />
        </a>
        <a href={`mailto:feedback@pulse.app?subject=DockIn feedback from ${displayName}`} className="flex items-center gap-3.5 px-4 py-3.5 last:rounded-b-card">
          <span className="grid place-items-center h-10 w-10 rounded-btn bg-success-dim shrink-0">
            <MessageSquare style={{ height: 18, width: 18, color: "#43D98C" }} />
          </span>
          <span className="flex-1 text-sm font-semibold">Feedback</span>
          <ChevronRight className="h-4 w-4 text-ink-faint" />
        </a>
      </Card>

      <AvatarPicker open={pickerOpen} onClose={() => setPickerOpen(false)} currentUrl={profile?.avatar_url ?? null} />
    </div>
  );
}
