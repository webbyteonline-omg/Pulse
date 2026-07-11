"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ChevronRight, ListChecks, Settings, Sparkles, Zap } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useLivePulseScore, useMyProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";

const ScoreGauge = dynamic(
  () => import("@/components/pulse-score/ScoreGauge").then((m) => m.ScoreGauge),
  { ssr: false, loading: () => <Skeleton className="h-14 w-14 rounded-full" /> }
);

const LINKS = [
  { href: "/profile/wrapped", label: "Wrapped", desc: "Daily, weekly & semester recaps", icon: Sparkles },
  { href: "/profile/pulse-score", label: "Pulse Score", desc: "Breakdown & 30-day history", icon: Zap },
  { href: "/profile/activity", label: "My Activity", desc: "Everything you've done, logged", icon: ListChecks },
  { href: "/settings", label: "Settings", desc: "Themes, privacy, notifications & data", icon: Settings },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const displayName = useAuthStore((s) => s.displayName)();
  const profileQuery = useMyProfile();
  const { breakdown } = useLivePulseScore();

  const profile = profileQuery.data;

  return (
    <div>
      <Header title="Profile" />

      <Card gradient className="p-5 mb-5 flex items-center gap-4">
        <Avatar name={displayName} userId={user?.id} size={56} />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold truncate">{displayName}</h2>
          <p className="text-sm text-ink-dim truncate">
            {profile ? `@${profile.username}` : user?.email}
          </p>
        </div>
        {breakdown && <ScoreGauge breakdown={breakdown} compact />}
      </Card>

      <div className="space-y-3">
        {LINKS.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Link href={link.href}>
              <Card interactive className="p-4 flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-btn bg-primary-dim grid place-items-center shrink-0">
                  <link.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{link.label}</p>
                  <p className="text-xs text-ink-dim truncate">{link.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-ink-faint shrink-0" />
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
