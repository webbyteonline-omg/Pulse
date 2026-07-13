"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { MoreVertical, UserMinus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "./OnlineIndicator";
import { useUnfriend } from "@/hooks/useFriends";
import { scoreColor } from "@/lib/pulseScore";
import type { UserProfile } from "@/lib/supabase/types";

export function FriendCard({ profile, index = 0 }: { profile: UserProfile; index?: number }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const unfriend = useUnfriend();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ delay: Math.min(0.3, 0.04 * index) }}
    >
      <Card interactive={false} className="p-4 flex items-center gap-3">
        <Link href={`/friends/${profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar name={profile.display_name ?? profile.username} userId={profile.id} src={profile.avatar_url} />
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
              DockIn
            </p>
          </div>
        </Link>
        <button
          onClick={() => setConfirmOpen(true)}
          aria-label={`More options for ${profile.display_name ?? profile.username}`}
          className="shrink-0 h-9 w-9 grid place-items-center rounded-btn text-ink-faint hover:text-ink hover:bg-line/40 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </Card>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={profile.display_name ?? profile.username}>
        <div className="space-y-4">
          <button
            onClick={() => {
              unfriend.mutate(profile.id);
              setConfirmOpen(false);
            }}
            disabled={unfriend.isPending}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-btn bg-danger-dim text-danger font-semibold text-sm hover:bg-danger/20 transition-colors"
          >
            <UserMinus className="h-4 w-4" /> Remove friend
          </button>
          <Button variant="secondary" className="w-full" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
