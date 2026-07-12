"use client";

import { RowSkeleton } from "@/components/ui/Skeleton";
import { MemberCard } from "./MemberCard";
import { useGroupMembers } from "@/hooks/useGroupMembers";

/** Simple, read-only members list (Group Detail's "Members" tab) — tapping
 * a member is a stub ("Coming soon") per spec; actual management lives on
 * the dedicated Members Management screen for admins. */
export function MembersList({ groupId, onMemberTap }: { groupId: string; onMemberTap: () => void }) {
  const membersQuery = useGroupMembers(groupId);
  const members = membersQuery.data ?? [];

  if (membersQuery.isLoading) return <RowSkeleton rows={4} />;

  return (
    <div className="space-y-1">
      {members.map((member) => (
        <MemberCard key={member.id} member={member} onClick={onMemberTap} />
      ))}
    </div>
  );
}
