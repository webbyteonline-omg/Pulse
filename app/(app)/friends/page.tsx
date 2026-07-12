"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SOCIAL_TABS, SubTabs } from "@/components/layout/SubTabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { FriendCard } from "@/components/friends/FriendCard";
import { FriendSearch } from "@/components/friends/FriendSearch";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useFriendRequests, useFriends, useRespondToRequest } from "@/hooks/useFriends";

function FriendsContent() {
  const searchParams = useSearchParams();
  const highlightRequests = searchParams.get("tab") === "requests";
  const friendsQuery = useFriends();
  const requestsQuery = useFriendRequests();
  const respond = useRespondToRequest();

  const friends = friendsQuery.data ?? [];
  const incoming = (requestsQuery.data ?? []).filter((r) => r.direction === "incoming");
  const outgoing = (requestsQuery.data ?? []).filter((r) => r.direction === "outgoing");

  return (
    <div>
      <Header title="Friends" subtitle={friends.length > 0 ? `${friends.length} friends` : undefined} />
      <SubTabs tabs={SOCIAL_TABS} layoutId="social-tabs" />

      <div className="mb-6">
        <FriendSearch />
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <section className={`mb-6 ${highlightRequests ? "ring-2 ring-primary/40 rounded-card p-1 -m-1" : ""}`}>
          <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-3">
            Requests ({incoming.length})
          </h2>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {incoming.map((request) => (
                <motion.div
                  key={request.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  className="flex items-center gap-3 bg-card border border-primary/30 rounded-card p-3.5"
                >
                  <Avatar
                    name={request.profile?.display_name ?? request.profile?.username ?? "?"}
                    userId={request.sender_id}
                    size={36}
                    src={request.profile?.avatar_url}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {request.profile?.display_name ?? request.profile?.username ?? "Someone"}
                    </p>
                    <p className="text-[11px] text-ink-dim">
                      @{request.profile?.username ?? "unknown"} wants to be friends
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={respond.isPending}
                    onClick={() => respond.mutate({ request, accept: true })}
                    aria-label="Accept"
                    className="h-11 w-11 grid place-items-center rounded-btn bg-success-dim text-success hover:bg-success/25 transition-colors"
                  >
                    <Check className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={respond.isPending}
                    onClick={() => respond.mutate({ request, accept: false })}
                    aria-label="Reject"
                    className="h-11 w-11 grid place-items-center rounded-btn bg-danger-dim text-danger hover:bg-danger/25 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Friends list */}
      {friendsQuery.isLoading ? (
        <RowSkeleton rows={3} />
      ) : friends.length === 0 ? (
        <EmptyState
          illustration="generic"
          title="No friends yet"
          description="Search your friends by username above — compare attendance, vote in polls, and race the leaderboard together."
        />
      ) : (
        <div className="space-y-3">
          {friends.map((profile, i) => (
            <FriendCard key={profile.id} profile={profile} index={i} />
          ))}
        </div>
      )}

      {/* Outgoing */}
      {outgoing.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-3">Sent</h2>
          <div className="space-y-2">
            {outgoing.map((request) => (
              <div key={request.id} className="flex items-center gap-3 bg-card border border-line rounded-card p-3.5 opacity-70">
                <Avatar
                  name={request.profile?.display_name ?? request.profile?.username ?? "?"}
                  size={32}
                  showOnline={false}
                  src={request.profile?.avatar_url}
                />
                <p className="flex-1 text-sm truncate">
                  @{request.profile?.username ?? "unknown"}
                </p>
                <span className="text-[11px] text-ink-dim font-semibold">Pending</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function FriendsPage() {
  return (
    <Suspense>
      <FriendsContent />
    </Suspense>
  );
}
