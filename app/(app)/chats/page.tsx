"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { useFriends } from "@/hooks/useFriends";
import { useChatRealtime, useConversations } from "@/hooks/useChats";

function msgTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function ChatsPage() {
  useChatRealtime();
  const convsQuery = useConversations();
  const friendsQuery = useFriends();

  const convs = convsQuery.data ?? [];
  const friends = friendsQuery.data ?? [];
  const chattedIds = new Set(convs.map((c) => c.friend.id));
  const quickStart = friends.filter((f) => !chattedIds.has(f.id));

  return (
    <div>
      <Header title="Chats" subtitle="Message your DockIn friends" />

      {/* Quick-start row */}
      {quickStart.length > 0 && (
        <div className="no-scrollbar -mx-4 mb-5 flex gap-4 overflow-x-auto px-4">
          {quickStart.map((f) => {
            const name = f.display_name ?? f.username;
            return (
              <Link key={f.id} href={`/chats/${f.id}`} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
                <Avatar name={name} size={56} src={f.avatar_url} showOnline userId={f.id} />
                <span className="max-w-full truncate text-[11px] font-semibold text-ink">{name}</span>
              </Link>
            );
          })}
        </div>
      )}

      {convsQuery.isLoading ? (
        <RowSkeleton rows={5} />
      ) : convs.length === 0 ? (
        <EmptyState
          illustration="generic"
          title="No chats yet"
          description="Start a conversation with a friend from the row above, or add friends to begin."
        />
      ) : (
        <div className="space-y-2">
          {convs.map((c) => {
            const name = c.friend.display_name ?? c.friend.username;
            return (
              <Link
                key={c.friend.id}
                href={`/chats/${c.friend.id}`}
                className="clay flex items-center gap-3 rounded-card px-3.5 py-3"
              >
                <Avatar name={name} size={48} src={c.friend.avatar_url} showOnline userId={c.friend.id} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">{name}</p>
                  <p className={`truncate text-xs ${c.unread > 0 ? "font-semibold text-ink" : "text-ink-dim"}`}>
                    {c.lastMessage.body}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-ink-faint">{msgTime(c.lastMessage.created_at)}</span>
                  {c.unread > 0 && (
                    <span className="clay-purple-btn flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold">
                      {c.unread > 9 ? "9+" : c.unread}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
