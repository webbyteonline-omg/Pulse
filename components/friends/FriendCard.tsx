"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Avatar } from "./OnlineIndicator";
import { scoreColor } from "@/lib/pulseScore";
import type { UserProfile } from "@/lib/supabase/types";

export function FriendCard({ profile, index = 0 }: { profile: UserProfile; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.3, 0.04 * index) }}
    >
      <Link href={`/friends/${profile.id}`}>
        <Card interactive className="p-4 flex items-center gap-3">
          <Avatar name={profile.display_name ?? profile.username} userId={profile.id} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{profile.display_name ?? profile.username}</p>
            <p className="text-[11px] text-ink-dim">@{profile.username}</p>
          </div>
          <div className="text-center shrink-0">
            <p
              className="text-lg font-black tabular-nums leading-none"
              style={{ color: scoreColor(profile.pulse_score) }}
            >
              {profile.pulse_score}
            </p>
            <p className="text-[9px] text-ink-faint font-bold uppercase tracking-wider mt-0.5">
              Pulse
            </p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
