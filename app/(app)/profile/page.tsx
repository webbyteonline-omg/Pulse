"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Crown,
  HeartPulse,
  HelpCircle,
  ListChecks,
  Lock,
  Map,
  MessageSquare,
  Pencil,
  Settings,
  Sparkles,
  Star,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { AvatarPicker } from "@/components/profile/AvatarPicker";
import { useSubjects } from "@/hooks/useAttendance";
import { useLivePulseScore, useMyProfile } from "@/hooks/useProfile";
import { attendancePercent } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

const ACCOUNT_LINKS = [
  { href: "/settings", label: "Edit Profile", desc: "Name, username & avatar", icon: UserRound },
  { href: "/settings", label: "Preferences", desc: "Theme, attendance defaults", icon: Settings },
  { href: "/settings#notifications", label: "Notifications", desc: "Push & email reminders", icon: Bell },
  { href: "/settings#privacy", label: "Privacy & Security", desc: "Sharing, encryption keys", icon: Lock },
];

const MORE_LINKS = [
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/profile/wrapped", label: "Wrapped", icon: Sparkles },
  { href: "/profile/pulse-score", label: "Pulse Score", icon: Zap },
  { href: "/profile/activity", label: "My Activity", icon: ListChecks },
  { href: "/map", label: "Campus Map", icon: Map },
  { href: "/health", label: "Health", icon: HeartPulse },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName)();
  const profileQuery = useMyProfile();
  const { breakdown } = useLivePulseScore();
  const subjectsQuery = useSubjects();
  const [pickerOpen, setPickerOpen] = useState(false);

  const profile = profileQuery.data;
  const subjects = subjectsQuery.data ?? [];
  const attended = subjects.reduce((s, x) => s + x.attended_classes, 0);
  const tracked = subjects.filter((s) => s.total_classes > 0);
  const avgAtt =
    tracked.length > 0
      ? Math.round(tracked.reduce((s, x) => s + attendancePercent(x.attended_classes, x.total_classes), 0) / tracked.length)
      : null;
  const studentId = `PLS${(user?.id ?? "00000").replace(/-/g, "").slice(0, 5).toUpperCase()}`;

  const share = async () => {
    const data = {
      title: "Pulse",
      text: "College life, one screen — attendance, money, friends & more. Join me on Pulse!",
      url: window.location.origin,
    };
    if (navigator.share) await navigator.share(data).catch(() => undefined);
    else await navigator.clipboard.writeText(data.url).catch(() => undefined);
  };

  return (
    <div>
      <Header
        title="Profile"
        action={
          <Link href="/settings" aria-label="Settings">
            <span className="grid place-items-center h-11 w-11 rounded-btn bg-card border border-line text-ink-dim">
              <Settings className="h-[18px] w-[18px]" />
            </span>
          </Link>
        }
      />

      {/* Profile hero */}
      <Card className="p-5 mb-4 flex items-center gap-4">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setPickerOpen(true)} aria-label="Change avatar" className="relative shrink-0">
          <Avatar name={displayName} userId={user?.id} size={80} src={profile?.avatar_url} />
          <span className="absolute -bottom-0.5 -right-0.5 grid place-items-center h-7 w-7 rounded-full bg-primary text-white border-[3px] border-card">
            <Pencil className="h-3 w-3" />
          </span>
        </motion.button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold truncate">{displayName}</h2>
          <p className="text-xs text-ink-dim truncate">{user?.email}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-primary-dim text-primary text-[10px] font-black">Student</span>
            <span className="text-[10px] text-ink-faint font-semibold">ID: {studentId}</span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-ink-faint shrink-0" />
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: BookOpen, color: "#6C63FF", value: String(attended), label: "Classes" },
          { icon: CheckCircle2, color: "#43D98C", value: avgAtt !== null ? `${avgAtt}%` : "—", label: "Attendance" },
          { icon: Star, color: "#FFD700", value: String((breakdown?.total ?? profile?.pulse_score ?? 0) * 10), label: "Pulse Points" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-card border border-line rounded-card p-3.5 flex flex-col items-center text-center"
          >
            <s.icon className="h-5 w-5 mb-1.5" style={{ color: s.color }} />
            <p className="text-lg font-black tabular-nums leading-tight">{s.value}</p>
            <p className="text-[10px] text-ink-dim font-semibold">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Invite card (design's "Pro" slot — real action: share) */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => void share()}
        className="w-full text-left relative overflow-hidden rounded-hero p-5 mb-5 bg-pulse-gradient text-white"
      >
        <div aria-hidden className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15 blur-2xl" />
        <div className="flex items-center gap-3">
          <span className="grid place-items-center h-11 w-11 rounded-full bg-white/20 shrink-0">
            <Crown className="h-5 w-5" fill="#fff" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-black">Bring your squad to Pulse</p>
            <p className="text-xs opacity-85 mt-0.5">Polls, leaderboards & streaks are better with friends</p>
          </div>
          <span className="px-3.5 py-2 rounded-full bg-white text-primary text-xs font-black shrink-0">Invite</span>
        </div>
      </motion.button>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {MORE_LINKS.map((l) => (
          <Link key={l.label} href={l.href} className="flex flex-col items-center gap-1.5 bg-card border border-line rounded-card py-3">
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
        <a href={`mailto:feedback@pulse.app?subject=Pulse feedback from ${displayName}`} className="flex items-center gap-3.5 px-4 py-3.5 last:rounded-b-card">
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
