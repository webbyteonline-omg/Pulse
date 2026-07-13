"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, UserPlus, Users } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { FriendCard } from "@/components/friends/FriendCard";
import { FriendsOverview } from "@/components/friends/FriendsOverview";
import { AddFriendSheet } from "@/components/friends/AddFriendSheet";
import { RequestsPanel } from "@/components/friends/RequestsPanel";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { useFriendRequests, useFriends } from "@/hooks/useFriends";
import { useMyGroups } from "@/hooks/useGroups";
import Link from "next/link";

type Tab = "friends" | "requests";

function FriendsContent() {
  const searchParams = useSearchParams();
  const friendsQuery = useFriends();
  const requestsQuery = useFriendRequests();
  const groupsQuery = useMyGroups();
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
            className="grid place-items-center h-11 w-11 rounded-btn clay text-ink-dim hover:text-ink transition-colors"
          >
            <UserPlus className="h-[18px] w-[18px]" />
          </button>
        }
        action={
          <button
            onClick={() => setAddOpen(true)}
            aria-label="Add friend"
            className="hidden md:grid place-items-center h-11 w-11 rounded-btn clay text-ink-dim hover:text-ink transition-colors"
          >
            <UserPlus className="h-[18px] w-[18px]" />
          </button>
        }
        showBell
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 clay rounded-btn p-1 mb-4">
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
              tab === t.id ? "clay-purple-btn" : "text-ink-dim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "friends" ? (
        <>
          {/* Your Groups — horizontal scroll */}
          {(groupsQuery.data ?? []).length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-bold text-ink">Your Groups</p>
                <Link href="/groups" className="text-xs font-semibold text-primary">
                  See all
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
                {(groupsQuery.data ?? []).map((group) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="flex flex-col items-center gap-1.5 shrink-0 w-16"
                  >
                    <GroupAvatar group={group} size={56} />
                    <p className="text-[11px] font-medium text-ink-dim text-center truncate w-full">
                      {group.name}
                    </p>
                  </Link>
                ))}
                <Link
                  href="/groups/create"
                  className="flex flex-col items-center gap-1.5 shrink-0 w-16"
                >
                  <div className="h-14 w-14 rounded-full grid place-items-center bg-card border border-dashed border-line text-ink-dim">
                    <Users className="h-5 w-5" />
                  </div>
                  <p className="text-[11px] font-medium text-ink-dim text-center truncate w-full">
                    New
                  </p>
                </Link>
              </div>
            </div>
          )}

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

          {/* Friends on campus — compact link instead of an inline map */}
          <Link
            href="/map"
            className="mt-4 flex items-center gap-2.5 px-3.5 py-3 rounded-card clay hover:bg-card-hover transition-colors"
          >
            <div className="h-9 w-9 rounded-btn bg-primary/15 grid place-items-center shrink-0">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <span className="flex-1 text-[13px] font-semibold text-ink">Find your friends on campus</span>
            <span className="text-xs font-semibold text-primary shrink-0">Open →</span>
          </Link>
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
