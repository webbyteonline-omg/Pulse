"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { useGroupByInviteCode, useJoinGroupByInviteCode } from "@/hooks/useGroups";
import { useGroupMembers } from "@/hooks/useGroupMembers";
import { useAuthStore } from "@/store/authStore";

export default function JoinGroupPage() {
  const params = useParams<{ inviteCode: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const groupQuery = useGroupByInviteCode(params.inviteCode);
  const membersQuery = useGroupMembers(groupQuery.data?.id);
  const joinGroup = useJoinGroupByInviteCode();

  if (groupQuery.isLoading) {
    return (
      <div className="pt-10">
        <RowSkeleton rows={2} />
      </div>
    );
  }

  if (!groupQuery.data) {
    return (
      <div className="pt-16 text-center">
        <p className="text-sm text-ink-dim">This invite link is invalid or has expired.</p>
        <Button className="mt-4" onClick={() => router.push("/groups")}>
          Go to Groups
        </Button>
      </div>
    );
  }

  const group = groupQuery.data;
  const creator = (membersQuery.data ?? []).find((m) => m.user_id === group.created_by)?.profile;
  const alreadyMember = (membersQuery.data ?? []).some((m) => m.user_id === user?.id);

  const join = async () => {
    await joinGroup.mutateAsync(group.id);
    router.push(`/groups/${group.id}`);
  };

  return (
    <div className="pt-10 flex flex-col items-center text-center">
      <GroupAvatar group={group} size={80} />
      <p className="mt-4 text-xl font-bold text-ink">{group.name}</p>
      <p className="mt-1 text-sm text-ink-dim">
        {group.memberCount} member{group.memberCount !== 1 ? "s" : ""}
        {creator && ` · Created by ${creator.display_name ?? creator.username}`}
      </p>

      <div className="mt-8 w-full max-w-xs">
        {alreadyMember ? (
          <>
            <p className="text-sm text-ink-dim mb-3">You&apos;re already in this group</p>
            <Button size="lg" className="w-full" onClick={() => router.push(`/groups/${group.id}`)}>
              Go to Group
            </Button>
          </>
        ) : (
          <Button size="lg" className="w-full" onClick={() => void join()} loading={joinGroup.isPending}>
            Join Group
          </Button>
        )}
      </div>
    </div>
  );
}
