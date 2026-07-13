"use client";

import Link from "next/link";
import { GroupAvatar } from "./GroupAvatar";
import type { FriendGroup, UserProfile } from "@/lib/supabase/types";

export interface GroupCardProps {
  group: FriendGroup;
  memberCount: number;
  /** Current user's rank within this group, 1-indexed, or null if unknown. */
  yourRank: number | null;
  /** Up to a few member profiles to render as overlapping avatars. */
  previewMembers: UserProfile[];
}

function rankColor(rank: number | null): string {
  if (rank === 1) return "#FFD700";
  if (rank === 2) return "#C0C0C0";
  if (rank === 3) return "#CD7F32";
  return "#6C63FF";
}

export function GroupCard({ group, memberCount, yourRank, previewMembers }: GroupCardProps) {
  const shown = previewMembers.slice(0, 3);
  const extra = memberCount - shown.length;
  const color = rankColor(yourRank);
  const progressPct = yourRank ? Math.max(15, 100 - (yourRank - 1) * 20) : 0;

  return (
    <Link
      href={`/groups/${group.id}`}
      className="flex items-center gap-3 p-3.5 rounded-card clay hover:bg-card-hover transition-colors"
    >
      <GroupAvatar group={group} size={56} />

      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-bold text-ink truncate">{group.name}</p>
        <p className="text-xs text-ink-dim mt-0.5">
          {memberCount} member{memberCount !== 1 ? "s" : ""}
        </p>
        {yourRank && (
          <p className="text-xs font-semibold mt-0.5" style={{ color }}>
            Your rank: #{yourRank}
          </p>
        )}
        {yourRank && (
          <div className="mt-1.5 h-1 rounded-full bg-line overflow-hidden w-full max-w-[120px]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, background: color }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center shrink-0 -space-x-2">
        {shown.map((member) => (
          <div
            key={member.id}
            className="h-7 w-7 rounded-full border-2 border-card bg-primary/20 text-primary grid place-items-center text-[11px] font-bold overflow-hidden"
          >
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.avatar_url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              (member.display_name ?? member.username).charAt(0).toUpperCase()
            )}
          </div>
        ))}
        {extra > 0 && (
          <div className="h-7 w-7 rounded-full border-2 border-card bg-card-hover text-ink-dim grid place-items-center text-[10px] font-bold">
            +{extra}
          </div>
        )}
      </div>
    </Link>
  );
}
