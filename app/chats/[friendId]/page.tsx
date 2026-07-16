"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useFriendProfile } from "@/hooks/useFriends";
import {
  useChatRealtime,
  useMarkThreadRead,
  useSendMessage,
  useThread,
} from "@/hooks/useChats";
import { useIsOnline } from "@/lib/realtime";
import { useAuthStore } from "@/store/authStore";

function bubbleTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export default function ChatThreadPage() {
  const router = useRouter();
  const params = useParams<{ friendId: string }>();
  const friendId = params.friendId;
  const uid = useAuthStore((s) => s.user?.id);

  useChatRealtime(friendId);
  const threadQuery = useThread(friendId);
  const friendQuery = useFriendProfile(friendId);
  const sendMessage = useSendMessage();
  const markRead = useMarkThreadRead();

  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const messages = threadQuery.data ?? [];
  const friend = friendQuery.data?.profile;
  const name = friend?.display_name ?? friend?.username ?? "Chat";
  const online = useIsOnline(friendId);

  // Scroll to newest whenever the thread changes.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark incoming messages read whenever the thread updates.
  useEffect(() => {
    if (friendId && messages.some((m) => m.recipient_id === uid && !m.read_at)) {
      markRead.mutate(friendId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, friendId]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      await sendMessage.mutateAsync({ recipientId: friendId, body });
    } catch {
      setText(body);
    }
  };

  return (
    <main className="clay-page flex min-h-dvh flex-col">
      {/* Header */}
      <header className="clay sticky top-0 z-20 flex items-center gap-3 rounded-none px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
        <button
          onClick={() => router.push("/chats")}
          aria-label="Back"
          className="flex size-9 items-center justify-center rounded-full text-ink"
        >
          <ArrowLeft className="size-5" strokeWidth={2.4} />
        </button>
        <Avatar name={name} size={40} src={friend?.avatar_url} showOnline userId={friendId} />
        <div>
          <p className="text-base font-bold text-ink">{name}</p>
          {online && <p className="text-[11px] font-semibold text-success">Active now</p>}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !threadQuery.isLoading && (
          <p className="mt-10 text-center text-sm text-ink-dim">
            Say hi to {name} 👋
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === uid;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                  mine ? "genz-gradient text-white rounded-br-md" : "bg-card shadow-md rounded-bl-md text-ink"
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-[15px] leading-snug">{m.body}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-white/70" : "text-ink-faint"}`}>
                  {bubbleTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="clay sticky bottom-0 z-20 flex items-end gap-2 rounded-none px-3 pt-2.5 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder="Message…"
          className="clay-inset max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-clay-purple/40"
        />
        <button
          onClick={send}
          disabled={!text.trim() || sendMessage.isPending}
          aria-label="Send"
          className="genz-gradient-btn flex size-11 shrink-0 items-center justify-center rounded-full disabled:opacity-50"
        >
          <Send className="size-5" strokeWidth={2.4} />
        </button>
      </div>
    </main>
  );
}
