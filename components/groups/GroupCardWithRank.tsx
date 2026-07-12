"use client";

import { GroupCard } from "./GroupCard";
import { useGroupLeaderboard } from "@/hooks/useGroupLeaderboard";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import type { GroupWithMemberCount } from "@/hooks/useGroups";

/** Wraps GroupCard with the extra per-group fetches (rank + preview
 * members) it needs — kept separate from GroupCard itself so GroupCard
 * stays a pure display component usable elsewhere without pulling in
 * leaderboard/member queries it doesn't always need. */
export function GroupCardWithRank({ group }: { group: GroupWithMemberCount }) {
  const leaderboardQuery = useGroupLeaderboard(group.id);
  const membersQuery = useGroupMembers(group.id);

  const yourEntry = (leaderboardQuery.data ?? []).find((e) => e.isYou);
  const previewMembers = (membersQuery.data ?? [])
    .map((m) => m.profile)
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <GroupCard
      group={group}
      memberCount={group.memberCount}
      yourRank={yourEntry?.rank ?? null}
      previewMembers={previewMembers}
    />
  );
}
