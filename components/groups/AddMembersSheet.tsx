"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useFriends } from "@/hooks/useFriends";
import { useAddMember } from "@/hooks/useGroupMembers";
import type { GroupMemberWithProfile } from "@/hooks/useGroupMembers";

export interface AddMembersSheetProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  existingMembers: GroupMemberWithProfile[];
}

export function AddMembersSheet({ open, onClose, groupId, existingMembers }: AddMembersSheetProps) {
  const { data: friends } = useFriends();
  const addMember = useAddMember();
  const [search, setSearch] = useState("");
  const [justAdded, setJustAdded] = useState<Set<string>>(new Set());

  const existingIds = new Set(existingMembers.map((m) => m.user_id));

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = friends ?? [];
    if (!term) return list;
    return list.filter(
      (f) =>
        (f.display_name ?? "").toLowerCase().includes(term) ||
        f.username.toLowerCase().includes(term)
    );
  }, [friends, search]);

  const add = async (userId: string) => {
    await addMember.mutateAsync({ groupId, userId });
    setJustAdded((prev) => new Set(prev).add(userId));
  };

  return (
    <Modal open={open} onClose={onClose} title="Add members">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search your friends..."
        className="mb-3"
      />
      {(friends ?? []).length === 0 ? (
        <p className="text-xs text-ink-faint py-4 text-center">You don&apos;t have any friends to add yet.</p>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {filtered.map((friend) => {
            const already = existingIds.has(friend.id) || justAdded.has(friend.id);
            return (
              <div key={friend.id} className="flex items-center gap-3 px-2 py-2 rounded-input">
                <Avatar
                  name={friend.display_name ?? friend.username}
                  size={40}
                  showOnline={false}
                  src={friend.avatar_url}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{friend.display_name ?? friend.username}</p>
                  <p className="text-[11px] text-ink-dim truncate">@{friend.username}</p>
                </div>
                {already ? (
                  <span className="text-[11px] text-ink-faint font-semibold shrink-0">Already added</span>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void add(friend.id)}
                    loading={addMember.isPending}
                  >
                    Add
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
