"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Search, Sparkles, UserPlus, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { FriendCard } from "@/components/friends/FriendCard";
import { AddFriendSheet } from "@/components/friends/AddFriendSheet";
import { RequestsPanel } from "@/components/friends/RequestsPanel";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { useFriendRequests, useFriends, useRespondToRequest } from "@/hooks/useFriends";
import { useMyGroups } from "@/hooks/useGroups";
import { useRealtime } from "@/lib/realtime";
import { vibeStatus } from "@/lib/utils";
import Link from "next/link";

type Tab = "friends" | "requests";

function FriendsContent() {
  const searchParams = useSearchParams();
  const friendsQuery = useFriends();
  const requestsQuery = useFriendRequests();
  const groupsQuery = useMyGroups();
  const respond = useRespondToRequest();
  const { onlineIds } = useRealtime();
  const [tab, setTab] = useState<Tab>("friends");
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (searchParams.get("tab") === "requests") setTab("requests");
  }, [searchParams]);

  const friends = friendsQuery.data ?? [];
  const incomingRequests = (requestsQuery.data ?? []).filter((r) => r.direction === "incoming");
  const pendingCount = incomingRequests.length;
  const firstRequest = incomingRequests[0];

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return friends;
    return friends.filter(
      (f) => (f.display_name ?? "").toLowerCase().includes(term) || f.username.toLowerCase().includes(term)
    );
  }, [friends, search]);

  const online = filtered.filter((f) => onlineIds.has(f.id));
  const rest = filtered.filter((f) => !onlineIds.has(f.id));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[32px] font-extrabold tracking-tight text-ink">Friends</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="genz-gradient-btn flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold"
        >
          <UserPlus className="size-4" strokeWidth={2.6} /> Add
        </button>
      </div>

      {/* Search */}
      <div className="clay-soft mb-4 flex items-center gap-2.5 rounded-2xl px-4 py-3">
        <Search className="size-4 shrink-0 text-ink-faint" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search friends"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>

      {tab === "friends" ? (
        <>
          {/* Incoming request — dark sparkle card */}
          {firstRequest && (
            <div className="relative mb-5 overflow-hidden rounded-clay bg-[#1a1225] p-4 text-white">
              <Sparkles className="absolute right-4 top-4 size-4 text-clay-yellow" />
              <p className="pr-8 text-sm font-extrabold">
                {firstRequest.profile?.display_name ?? firstRequest.profile?.username} wants to connect
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Avatar
                  name={firstRequest.profile?.display_name ?? firstRequest.profile?.username ?? "?"}
                  userId={firstRequest.sender_id}
                  size={40}
                  src={firstRequest.profile?.avatar_url}
                  showOnline={false}
                />
                <button
                  onClick={() => respond.mutate({ request: firstRequest, accept: true })}
                  disabled={respond.isPending}
                  className="genz-gradient rounded-full px-4 py-2 text-xs font-black"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond.mutate({ request: firstRequest, accept: false })}
                  disabled={respond.isPending}
                  className="rounded-full bg-white/15 px-4 py-2 text-xs font-black"
                >
                  Decline
                </button>
                {pendingCount > 1 && (
                  <button
                    onClick={() => setTab("requests")}
                    className="ml-auto shrink-0 text-[11px] font-bold text-white/60"
                  >
                    +{pendingCount - 1} more
                  </button>
                )}
              </div>
            </div>
          )}

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

          {friendsQuery.isLoading ? (
            <RowSkeleton rows={3} />
          ) : friends.length === 0 ? (
            <EmptyState
              illustration="generic"
              title="Dost nahi? Sad life bhai 😔"
              description="Invite karo apne classmates ko — attendance compare karo, saath mein rho."
              actionLabel="Dost banana hai? 🤙"
              onAction={() => setAddOpen(true)}
            />
          ) : (
            <>
              {online.length > 0 && (
                <section className="mb-6">
                  <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                    Online Now
                  </h2>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-4 px-4">
                    {online.map((f) => (
                      <Link
                        key={f.id}
                        href={`/friends/${f.id}`}
                        className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"
                      >
                        <Avatar name={f.display_name ?? f.username} userId={f.id} src={f.avatar_url} size={52} />
                        <span className="text-[10px] font-semibold leading-tight text-ink-dim">
                          {vibeStatus(f.id)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                All Friends · {friends.length}
              </h2>
              <div className="space-y-3">
                {rest.map((profile, i) => (
                  <FriendCard key={profile.id} profile={profile} index={i} />
                ))}
              </div>
            </>
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
        <>
          <button onClick={() => setTab("friends")} className="mb-4 text-xs font-semibold text-primary">
            ← Back to Friends
          </button>
          <RequestsPanel />
        </>
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
