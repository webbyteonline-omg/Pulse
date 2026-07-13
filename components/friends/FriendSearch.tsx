"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Avatar } from "./OnlineIndicator";
import {
  useFriendRequests,
  useFriends,
  useSendFriendRequest,
  useUserSearch,
} from "@/hooks/useFriends";

/** Search users by username and send requests. */
export function FriendSearch() {
  const [term, setTerm] = useState("");
  const searchQuery = useUserSearch(term);
  const sendRequest = useSendFriendRequest();
  const { data: friends } = useFriends();
  const { data: requests } = useFriendRequests();
  const [error, setError] = useState<string | null>(null);

  const friendIds = new Set((friends ?? []).map((f) => f.id));
  const requestedIds = new Set(
    (requests ?? []).map((r) => (r.direction === "outgoing" ? r.receiver_id : r.sender_id))
  );

  return (
    <div>
      <Input
        placeholder="Search by username…"
        value={term}
        onChange={(e) => {
          setTerm(e.target.value);
          setError(null);
        }}
        rightSlot={<Search className="h-4 w-4 text-ink-faint" />}
        aria-label="Search users"
      />
      {error && (
        <p className="mt-2 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      <AnimatePresence>
        {term.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 clay rounded-card divide-y divide-line/60 overflow-hidden"
          >
            {searchQuery.isLoading ? (
              <p className="p-4 text-sm text-ink-dim">Searching…</p>
            ) : (searchQuery.data ?? []).length === 0 ? (
              <p className="p-4 text-sm text-ink-dim">No one found with that username.</p>
            ) : (
              (searchQuery.data ?? []).map((profile) => {
                const isFriend = friendIds.has(profile.id);
                const isRequested = requestedIds.has(profile.id);
                return (
                  <div key={profile.id} className="flex items-center gap-3 p-3">
                    <Avatar name={profile.display_name ?? profile.username} userId={profile.id} size={36} src={profile.avatar_url} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {profile.display_name ?? profile.username}
                      </p>
                      <p className="text-[11px] text-ink-dim">@{profile.username}</p>
                    </div>
                    {isFriend ? (
                      <span className="text-[11px] font-bold text-success flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> Friends
                      </span>
                    ) : isRequested ? (
                      <span className="text-[11px] font-bold text-ink-dim">Requested</span>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        disabled={sendRequest.isPending}
                        onClick={() =>
                          sendRequest.mutate(profile.id, {
                            onError: (err) => setError(err.message),
                          })
                        }
                        aria-label={`Add ${profile.username}`}
                        className="h-11 w-11 grid place-items-center rounded-btn bg-primary-dim text-primary hover:bg-primary/25 transition-colors"
                      >
                        <UserPlus className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
