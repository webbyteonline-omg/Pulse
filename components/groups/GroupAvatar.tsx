"use client";

import type { FriendGroup } from "@/lib/supabase/types";

export interface GroupAvatarProps {
  group: Pick<FriendGroup, "avatar_emoji" | "avatar_image_url" | "color" | "name">;
  size?: number;
}

/** Reusable group avatar — uploaded photo if set, otherwise the group's
 * chosen emoji on a colored circle using the group's own accent color
 * (deliberately hardcoded per-group, not a theme variable — each group
 * picks its own color and it stays that color in both light and dark). */
export function GroupAvatar({ group, size = 56 }: GroupAvatarProps) {
  if (group.avatar_image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={group.avatar_image_url}
        alt={group.name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className="rounded-full grid place-items-center shrink-0"
      style={{ width: size, height: size, background: `${group.color}26` }}
    >
      <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{group.avatar_emoji}</span>
    </div>
  );
}
