"use client";

import { Crown, Trash2, User } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { GroupMemberWithProfile } from "@/hooks/useGroupMembers";

export interface MemberActionsSheetProps {
  open: boolean;
  onClose: () => void;
  member: GroupMemberWithProfile | null;
  onMakeAdmin: () => void;
  onRemove: () => void;
  onViewProfile: () => void;
}

/** 3-dot menu — a bottom sheet, not a floating popover, per spec. */
export function MemberActionsSheet({
  open,
  onClose,
  member,
  onMakeAdmin,
  onRemove,
  onViewProfile,
}: MemberActionsSheetProps) {
  if (!member) return null;
  const name = member.profile?.display_name ?? member.profile?.username ?? "this member";

  return (
    <Modal open={open} onClose={onClose} title={name}>
      <div className="space-y-1">
        <button
          onClick={() => {
            onMakeAdmin();
            onClose();
          }}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-input hover:bg-card transition-colors text-left"
        >
          <Crown className="h-[18px] w-[18px] text-warning" />
          <span className="text-sm font-medium text-ink">Make admin</span>
        </button>

        <button
          onClick={() => {
            onViewProfile();
            onClose();
          }}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-input hover:bg-card transition-colors text-left"
        >
          <User className="h-[18px] w-[18px] text-ink-dim" />
          <span className="text-sm font-medium text-ink">View profile</span>
        </button>

        <button
          onClick={() => {
            onRemove();
            onClose();
          }}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-input hover:bg-danger-dim transition-colors text-left"
        >
          <Trash2 className="h-[18px] w-[18px] text-danger" />
          <span className="text-sm font-medium text-danger">Remove from group</span>
        </button>
      </div>
    </Modal>
  );
}
