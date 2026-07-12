"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { UserPlus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { FriendCard } from "@/components/friends/FriendCard";
import { FriendsOverview } from "@/components/friends/FriendsOverview";
import { AddFriendSheet } from "@/components/friends/AddFriendSheet";
import { RequestsPanel } from "@/components/friends/RequestsPanel";
import { useFriendRequests, useFriends } from "@/hooks/useFriends";
import { useLocationSharing } from "@/hooks/useLocationSharing";

// Leaflet touches `window` — client-only.
const FriendsMap = dynamic(() => import("@/components/friends/FriendsMap"), {
  ssr: false,
  loading: () => <Skeleton className="h-[320px] w-full rounded-card" />,
});

type Tab = "friends" | "requests";

function FriendsContent() {
  const searchParams = useSearchParams();
  const friendsQuery = useFriends();
  const requestsQuery = useFriendRequests();
  const [tab, setTab] = useState<Tab>("friends");
  const [addOpen, setAddOpen] = useState(false);
  const { isSharing, toggleSharing, permissionDenied } = useLocationSharing();

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

          {/* Friends on campus — live location sharing */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-base font-bold text-ink">Friends on campus</p>
                <p className="text-xs text-ink-dim mt-0.5">Real-time locations of friends</p>
              </div>
              <button
                onClick={toggleSharing}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: isSharing ? "rgba(67,217,140,0.13)" : "rgba(108,99,255,0.13)",
                  border: `1px solid ${isSharing ? "rgba(67,217,140,0.27)" : "rgba(108,99,255,0.27)"}`,
                  color: isSharing ? "#43D98C" : "#6C63FF",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: isSharing ? "#43D98C" : "#6C63FF" }}
                />
                {isSharing ? "Sharing" : "Share location"}
              </button>
            </div>

            {permissionDenied && (
              <div
                className="rounded-input px-3.5 py-2.5 mb-3"
                style={{ background: "rgba(255,92,92,0.09)", border: "1px solid rgba(255,92,92,0.2)" }}
              >
                <p className="text-[13px]" style={{ color: "#FF5C5C" }}>
                  Location permission denied. Enable it in your browser settings.
                </p>
              </div>
            )}

            <div className="rounded-card overflow-hidden border border-line" style={{ height: 320 }}>
              <FriendsMap />
            </div>

            <p className="text-center text-[11px] text-ink-faint mt-2 leading-relaxed">
              Only your friends can see your location. Turn off sharing anytime.
            </p>
          </div>
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
