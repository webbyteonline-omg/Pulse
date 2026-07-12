"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Pencil, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { GroupLeaderboard } from "@/components/groups/GroupLeaderboard";
import { MembersList } from "@/components/groups/MembersList";
import { InviteSheet } from "@/components/groups/InviteSheet";
import { useGroupById } from "@/hooks/useGroups";
import { useGroupMembers, useLeaveGroup } from "@/hooks/useGroupMembers";
import { useToast } from "@/hooks/useToast";

type Tab = "leaderboard" | "members";

export default function GroupDetailPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const router = useRouter();

  const groupQuery = useGroupById(groupId);
  const membersQuery = useGroupMembers(groupId);
  const leaveGroup = useLeaveGroup();

  const [tab, setTab] = useState<Tab>("leaderboard");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  if (groupQuery.isLoading) {
    return (
      <div>
        <RowSkeleton rows={1} />
        <div className="mt-6">
          <RowSkeleton rows={3} />
        </div>
      </div>
    );
  }
  if (!groupQuery.data) {
    return <p className="text-center text-sm text-ink-dim py-10">Group not found.</p>;
  }

  const { group, myRole } = groupQuery.data;
  const isAdmin = myRole === "admin";
  const members = membersQuery.data ?? [];
  const creator = members.find((m) => m.user_id === group.created_by)?.profile;
  const shown = members.slice(0, 5);
  const extra = members.length - shown.length;

  const leave = async () => {
    setLeaveError(null);
    try {
      await leaveGroup.mutateAsync(group.id);
      router.push("/groups");
    } catch (err) {
      setLeaveError(err instanceof Error ? err.message : "Couldn't leave group");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push("/groups")}
          aria-label="Back"
          className="p-2 -ml-2 min-h-[44px] min-w-[44px] rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center truncate px-2">{group.name}</h1>
        {isAdmin ? (
          <button
            onClick={() => router.push(`/groups/${group.id}/members`)}
            aria-label="Edit group"
            className="p-2 -mr-2 min-h-[44px] min-w-[44px] rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
        ) : (
          <div className="w-11" />
        )}
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center mb-5">
        <GroupAvatar group={group} size={64} />
        <p className="mt-3 text-xl font-bold text-ink">{group.name}</p>
        <p className="mt-1 text-xs text-ink-dim">
          {members.length} member{members.length !== 1 ? "s" : ""}
          {creator && ` · Created by ${creator.display_name ?? creator.username}`}
        </p>

        {shown.length > 0 && (
          <div className="flex items-center mt-3 -space-x-2.5">
            {shown.map((m) => (
              <div
                key={m.id}
                className="h-10 w-10 rounded-full border-2 border-bg bg-primary/20 text-primary grid place-items-center text-xs font-bold overflow-hidden"
              >
                {m.profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  (m.profile?.display_name ?? m.profile?.username ?? "?").charAt(0).toUpperCase()
                )}
              </div>
            ))}
            {extra > 0 && (
              <div className="h-10 w-10 rounded-full border-2 border-bg bg-card-hover text-ink-dim grid place-items-center text-[11px] font-bold">
                +{extra}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <Button variant="secondary" size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus className="h-3.5 w-3.5" /> Invite Member
          </Button>
          <Button variant="danger" size="sm" onClick={() => setLeaveConfirmOpen(true)}>
            Leave Group
          </Button>
        </div>

        {isAdmin && (
          <button
            onClick={() => router.push(`/groups/${group.id}/members`)}
            className="mt-2 text-xs font-semibold text-primary"
          >
            Edit Group
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-line rounded-btn p-1 mb-4">
        {(
          [
            { id: "leaderboard" as const, label: "Leaderboard" },
            { id: "members" as const, label: "Members" },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-10 rounded-input text-xs font-bold transition-colors ${
              tab === t.id ? "bg-primary text-white" : "text-ink-dim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "leaderboard" ? (
        <GroupLeaderboard groupId={group.id} />
      ) : (
        <MembersList groupId={group.id} onMemberTap={() => showToast("Coming soon")} />
      )}

      <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} group={group} />

      <Modal open={leaveConfirmOpen} onClose={() => setLeaveConfirmOpen(false)} title="Leave group?" variant="center">
        <p className="text-sm text-ink-dim mb-4">
          You&apos;ll lose access to {group.name}&apos;s leaderboard and member list. You can rejoin later
          via invite.
        </p>
        {leaveError && (
          <p className="text-sm text-danger mb-3" role="alert">
            {leaveError}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setLeaveConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => void leave()} loading={leaveGroup.isPending}>
            Leave Group
          </Button>
        </div>
      </Modal>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-card border border-line rounded-full px-4 py-2.5 text-xs font-bold shadow-2xl whitespace-nowrap"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
