"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Camera, Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { SnapViewer } from "@/components/snaps/SnapViewer";
import { SendSnapSheet } from "@/components/snaps/SendSnapSheet";
import { useFriends } from "@/hooks/useFriends";
import { useInboxSnaps, useSnapRealtime, type InboxSnap } from "@/hooks/useSnaps";

function snapAge(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SnapsPage() {
  useSnapRealtime();
  const inboxQuery = useInboxSnaps();
  const friendsQuery = useFriends();

  const [viewing, setViewing] = useState<InboxSnap | null>(null);
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);

  const inbox = inboxQuery.data ?? [];
  const friends = friendsQuery.data ?? [];

  return (
    <div>
      <Header title="Snaps" subtitle="Ephemeral photos · view once" />

      {/* Inbox */}
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-ink">
        <Sparkles className="size-4 text-clay-purple" /> New Snaps
        {inbox.length > 0 && (
          <span className="clay-purple-btn flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold">
            {inbox.length}
          </span>
        )}
      </h2>

      {inboxQuery.isLoading ? (
        <RowSkeleton rows={3} />
      ) : inbox.length === 0 ? (
        <div className="clay mb-6 rounded-card p-6 text-center">
          <p className="text-sm font-semibold text-ink">Boring mat ban 📸</p>
          <p className="mt-1 text-xs text-ink-dim">Snaps from friends will appear here — tap to view once.</p>
        </div>
      ) : (
        <div className="mb-6 space-y-2.5">
          {inbox.map((snap) => {
            const name = snap.sender?.display_name ?? snap.sender?.username ?? "Someone";
            return (
              <button
                key={snap.id}
                onClick={() => setViewing(snap)}
                className="clay flex w-full items-center gap-3 rounded-card px-3.5 py-3 text-left"
              >
                <Avatar name={name} size={44} src={snap.sender?.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{name}</p>
                  <p className="text-xs font-semibold text-clay-purple">Tap to view · {snapAge(snap.created_at)}</p>
                </div>
                <span className="clay-purple-btn flex size-10 items-center justify-center rounded-full">
                  <Camera className="size-5" strokeWidth={2.2} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Send */}
      <h2 className="mb-3 text-[15px] font-bold text-ink">Send a Snap</h2>
      {friends.length === 0 ? (
        <EmptyState
          illustration="generic"
          title="Dost banana hai? 🤙"
          description="Once you have friends on DockIn, snap them a photo that disappears after one view."
        />
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {friends.map((f) => {
            const name = f.display_name ?? f.username;
            return (
              <button
                key={f.id}
                onClick={() => setTarget({ id: f.id, name })}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="relative">
                  <Avatar name={name} size={56} src={f.avatar_url} />
                  <span className="clay-purple-btn absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full ring-2 ring-bg">
                    <Camera className="size-3.5" strokeWidth={2.4} />
                  </span>
                </span>
                <span className="max-w-full truncate text-[11px] font-semibold text-ink">{name}</span>
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {viewing && <SnapViewer snap={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>

      {target && (
        <SendSnapSheet
          open={!!target}
          onClose={() => setTarget(null)}
          friendId={target.id}
          friendName={target.name}
        />
      )}
    </div>
  );
}
