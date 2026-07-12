"use client";

import { Crown } from "lucide-react";
import { Avatar } from "@/components/friends/OnlineIndicator";
import type { GroupMemberWithProfile } from "@/hooks/useGroupMembers";

export interface MemberCardProps {
  member: GroupMemberWithProfile;
  onClick?: () => void;
  rightSlot?: React.ReactNode;
}

/** Simple member row — avatar, name, username, pulse score, admin badge. */
export function MemberCard({ member, onClick, rightSlot }: MemberCardProps) {
  const profile = member.profile;
  const name = profile?.display_name ?? profile?.username ?? "Member";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex items-center gap-3 w-full px-2 py-2.5 rounded-input hover:bg-card transition-colors text-left disabled:cursor-default"
    >
      <Avatar name={name} size={40} showOnline={false} src={profile?.avatar_url} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold truncate text-ink">{name}</p>
          {member.role === "admin" && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#FFD70022] text-[10px] font-bold shrink-0" style={{ color: "#FFD700" }}>
              <Crown className="h-2.5 w-2.5" /> Admin
            </span>
          )}
        </div>
        <p className="text-[11px] text-ink-dim truncate">
          @{profile?.username ?? "unknown"}
          {profile && ` · Pulse Score: ${profile.pulse_score}`}
        </p>
      </div>
      {rightSlot}
    </button>
  );
}
