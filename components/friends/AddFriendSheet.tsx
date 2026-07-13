"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Link2, Search, Share2, UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "./OnlineIndicator";
import {
  useFriendRequests,
  useFriends,
  useSendFriendRequest,
  useUserSearch,
} from "@/hooks/useFriends";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMyProfile } from "@/hooks/useProfile";

export function AddFriendSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState("");
  const debouncedTerm = useDebouncedValue(term, 300);
  const searchQuery = useUserSearch(debouncedTerm);
  const sendRequest = useSendFriendRequest();
  const { data: friends } = useFriends();
  const { data: requests } = useFriendRequests();
  const [error, setError] = useState<string | null>(null);
  const [justSent, setJustSent] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const myProfile = useMyProfile();
  const username = myProfile.data?.username;

  useEffect(() => {
    if (open) {
      setTerm("");
      setError(null);
      setJustSent(new Set());
    }
  }, [open]);

  const friendIds = new Set((friends ?? []).map((f) => f.id));
  const requestedIds = new Set(
    (requests ?? []).map((r) => (r.direction === "outgoing" ? r.receiver_id : r.sender_id))
  );

  const isSearching = debouncedTerm.trim().length >= 2;
  const results = searchQuery.data ?? [];
  const showSkeleton = isSearching && (searchQuery.isLoading || term !== debouncedTerm);

  const inviteLink = `https://pulse.app/invite${username ? `?ref=${username}` : ""}`;

  const shareInvite = async () => {
    const shareData = {
      title: "Join me on DockIn",
      text: "Track attendance, budgets, and campus life together on DockIn.",
      url: inviteLink,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(inviteLink);
      setToast("Link copied!");
    } catch {
      setToast("Couldn't copy — long-press to copy manually");
    }
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Friend">
      <div className="space-y-5">
        <Input
          placeholder="Search by username or name…"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setError(null);
          }}
          rightSlot={<Search className="h-4 w-4 text-ink-faint" />}
          aria-label="Search users"
          autoFocus
        />

        {error && (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        {term.trim().length > 0 && term.trim().length < 2 && (
          <p className="text-xs text-ink-dim">Keep typing — at least 2 characters.</p>
        )}

        {isSearching && (
          <div className="clay-inset rounded-card divide-y divide-line/60 overflow-hidden">
            {showSkeleton ? (
              <div className="p-3">
                <RowSkeleton rows={2} />
              </div>
            ) : results.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-sm text-ink-dim">No users found</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {results.map((profile) => {
                  const isFriend = friendIds.has(profile.id);
                  const isRequested = requestedIds.has(profile.id) || justSent.has(profile.id);
                  return (
                    <motion.div
                      key={profile.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-3"
                    >
                      <Avatar
                        name={profile.display_name ?? profile.username}
                        userId={profile.id}
                        size={40}
                        src={profile.avatar_url}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {profile.display_name ?? profile.username}
                        </p>
                        <p className="text-[11px] text-ink-dim">@{profile.username}</p>
                      </div>
                      {isFriend ? (
                        <span className="shrink-0 flex items-center gap-1 px-3 h-9 rounded-full bg-success-dim text-success text-[11px] font-bold">
                          <Check className="h-3.5 w-3.5" /> Friends
                        </span>
                      ) : isRequested ? (
                        <span className="shrink-0 px-3 h-9 grid place-items-center rounded-full bg-line/40 text-ink-dim text-[11px] font-bold">
                          Requested
                        </span>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.92 }}
                          disabled={sendRequest.isPending}
                          onClick={() => {
                            // Optimistic: flip the button immediately, revert on error.
                            setJustSent((s) => new Set(s).add(profile.id));
                            sendRequest.mutate(profile.id, {
                              onError: (err) => {
                                setError(err.message);
                                setJustSent((s) => {
                                  const next = new Set(s);
                                  next.delete(profile.id);
                                  return next;
                                });
                              },
                            });
                          }}
                          aria-label={`Add ${profile.username}`}
                          className="shrink-0 min-h-[44px] flex items-center gap-1.5 px-3.5 rounded-full clay-purple-btn text-[11px] font-bold hover:bg-primary/90 transition-colors"
                        >
                          <UserPlus className="h-3.5 w-3.5" /> Add
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Invite a friend to DockIn */}
        <div className="pt-1 border-t border-line/60">
          <p className="pt-4 text-sm font-semibold mb-1">Invite a friend to DockIn</p>
          <p className="text-xs text-ink-dim mb-3">
            Not on DockIn yet? Send them your invite link.
          </p>
          <button
            onClick={shareInvite}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 rounded-btn bg-primary-dim text-primary text-sm font-bold px-4 py-2.5 hover:bg-primary/20 transition-colors"
          >
            {typeof navigator !== "undefined" && "share" in navigator ? (
              <Share2 className="h-4 w-4" />
            ) : (
              <Link2 className="h-4 w-4" />
            )}
            Share Invite Link
          </button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-ink text-bg rounded-full px-4 py-2.5 text-xs font-bold shadow-2xl whitespace-nowrap"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
