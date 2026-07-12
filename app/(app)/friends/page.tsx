"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { FriendCard } from "@/components/friends/FriendCard";
import { FriendsOverview } from "@/components/friends/FriendsOverview";
import { AddFriendSheet } from "@/components/friends/AddFriendSheet";
import { RequestsPanel } from "@/components/friends/RequestsPanel";
import { useFriendRequests, useFriends } from "@/hooks/useFriends";

type Tab = "friends" | "requests";

function FriendsContent() {
  const searchParams = useSearchParams();
  const friendsQuery = useFriends();
  const requestsQuery = useFriendRequests();
  const [tab, setTab] = useState<Tab>("friends");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("tab") === "requests") setTab("requests");
  }, [searchParams]);

  const friends = friendsQuery.data ?? [];
  const pendingCount = (requestsQuery.data ?? []).filter((r) => r.direction === "incoming").length;

  return (
    <div>
      <Header
        title="Friends"
        subtitle={friends.length > 0 ? `${friends.length} friends` : undefined}
        mobileAction={
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add friend"
            className="grid place-items-center h-11 w-11 rounded-btn bg-card border border-line text-ink-dim hover:text-ink transition-colors"
          >
            <UserPlus className="h-[18px] w-[18px]" />
          </button>
        }
        action={
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add friend"
            className="hidden md:grid place-items-center h-11 w-11 rounded-btn bg-card border border-line text-ink-dim hover:text-ink transition-colors"
          >
            <UserPlus className="h-[18px] w-[18px]" />
          </button>
        }
        showBell
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-line rounded-btn p-1 mb-6">
        {(
          [
            { id: "friends" as const, label: "My Friends" },
            { id: "requests" as const, label: `Requests${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`relative flex-1 h-10 grid place-items-center rounded-input text-xs font-bold transition-colors ${
              tab === t.id ? "bg-primary text-white" : "text-ink-dim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "friends" ? (
        <>
          <FriendsOverview />

          {friendsQuery.isLoading ? (
            <RowSkeleton rows={3} />
          ) : friends.length === 0 ? (
            <EmptyState
              illustration="generic"
              title="No friends yet"
              description="Add friends by username — compare attendance, vote in polls, and race the leaderboard together."
              actionLabel="Add Friends"
              onAction={() => setAddOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {friends.map((profile, i) => (
                <FriendCard key={profile.id} profile={profile} index={i} />
              ))}
            </div>
          )}
        </>
      ) : (
        <RequestsPanel />
      )}

      <AddFriendSheet open={addOpen} onClose={() => setAddOpen(false)} />
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
