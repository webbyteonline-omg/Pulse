"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { MemberCard } from "@/components/groups/MemberCard";
import { AddMembersSheet } from "@/components/groups/AddMembersSheet";
import { MemberActionsSheet } from "@/components/groups/MemberActionsSheet";
import { useGroupById, useDeleteGroup } from "@/hooks/useGroups";
import {
  useGroupMembers,
  useMakeAdmin,
  useRemoveMember,
  type GroupMemberWithProfile,
} from "@/hooks/useGroupMembers";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/useToast";

export default function GroupMembersPage() {
  const params = useParams<{ groupId: string }>();
  const groupId = params.groupId;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const groupQuery = useGroupById(groupId);
  const membersQuery = useGroupMembers(groupId);
  const makeAdmin = useMakeAdmin();
  const removeMember = useRemoveMember();
  const deleteGroup = useDeleteGroup();

  const [addOpen, setAddOpen] = useState(false);
  const [actionsFor, setActionsFor] = useState<GroupMemberWithProfile | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { toast, showToast } = useToast();

  const members = membersQuery.data ?? [];
  const admins = members.filter((m) => m.role === "admin");
  const regular = members.filter((m) => m.role !== "admin");

  // Admin-only screen — redirect anyone else back to the group detail page.
  if (groupQuery.data && groupQuery.data.myRole !== "admin") {
    router.replace(`/groups/${groupId}`);
    return null;
  }

  if (groupQuery.isLoading || membersQuery.isLoading) {
    return (
      <div className="pt-4">
        <RowSkeleton rows={4} />
      </div>
    );
  }
  if (!groupQuery.data) {
    return <p className="text-center text-sm text-ink-dim py-10">Group not found.</p>;
  }
  const { group } = groupQuery.data;

  const confirmDelete = async () => {
    setDeleteError(null);
    try {
      await deleteGroup.mutateAsync(group.id);
      router.push("/groups");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Couldn't delete group");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push(`/groups/${group.id}`)}
          aria-label="Back"
          className="p-2 -ml-2 min-h-[44px] min-w-[44px] rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 truncate">Members ({members.length})</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1 px-3 h-9 rounded-full clay-purple-btn text-xs font-bold shrink-0"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {admins.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs font-bold text-ink-dim uppercase tracking-wider mb-2 px-1">Admin</h2>
          <div className="space-y-1">
            {admins.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        </section>
      )}

      {regular.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-bold text-ink-dim uppercase tracking-wider mb-2 px-1">Members</h2>
          <div className="space-y-1">
            {regular.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                rightSlot={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActionsFor(member);
                    }}
                    aria-label="Member options"
                    className="p-2 -mr-1 text-ink-faint hover:text-ink shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Danger zone */}
      <section className="mt-8 pt-6 border-t border-line">
        <h2 className="text-xs font-bold text-danger uppercase tracking-wider mb-3">Danger Zone</h2>
        <Button variant="danger" className="w-full" onClick={() => setDeleteConfirmOpen(true)}>
          Delete Group
        </Button>
        <p className="text-center text-[11px] text-ink-faint mt-2">This cannot be undone.</p>
      </section>

      <AddMembersSheet
        open={addOpen}
        onClose={() => setAddOpen(false)}
        groupId={group.id}
        existingMembers={members}
      />

      <MemberActionsSheet
        open={!!actionsFor}
        onClose={() => setActionsFor(null)}
        member={actionsFor}
        onMakeAdmin={() => {
          if (actionsFor) void makeAdmin.mutateAsync({ groupId: group.id, userId: actionsFor.user_id });
        }}
        onRemove={() => {
          if (actionsFor) void removeMember.mutateAsync({ groupId: group.id, userId: actionsFor.user_id });
        }}
        onViewProfile={() => showToast("Coming soon")}
      />

      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title={`Delete ${group.name}?`} variant="center">
        <p className="text-sm text-ink-dim mb-4">
          All {members.length} member{members.length !== 1 ? "s" : ""} will lose access. This cannot
          be undone.
        </p>
        {deleteError && (
          <p className="text-sm text-danger mb-3" role="alert">
            {deleteError}
          </p>
        )}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => void confirmDelete()}
            loading={deleteGroup.isPending}
          >
            Delete Group
          </Button>
        </div>
      </Modal>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 clay rounded-full px-4 py-2.5 text-xs font-bold shadow-2xl whitespace-nowrap"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
