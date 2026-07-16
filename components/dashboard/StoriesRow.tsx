"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { SnapViewer } from "@/components/snaps/SnapViewer";
import { useMyProfile } from "@/hooks/useProfile";
import { useInboxSnaps, useSnapRealtime, type InboxSnap } from "@/hooks/useSnaps";
import { useAuthStore } from "@/store/authStore";

/** Snapchat-style stories row: your story + friends' unopened snaps. */
export function StoriesRow() {
  useSnapRealtime();
  const router = useRouter();
  const inboxQuery = useInboxSnaps();
  const profileQuery = useMyProfile();
  const myName = useAuthStore((s) => s.displayName)();
  const [viewing, setViewing] = useState<InboxSnap | null>(null);

  // One story ring per sender (their latest unopened snap).
  const stories = useMemo(() => {
    const seen = new Set<string>();
    const out: InboxSnap[] = [];
    for (const s of inboxQuery.data ?? []) {
      if (seen.has(s.sender_id)) continue;
      seen.add(s.sender_id);
      out.push(s);
    }
    return out;
  }, [inboxQuery.data]);

  return (
    <div className="mb-5">
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
        {/* Your story */}
        <button
          onClick={() => router.push("/snaps")}
          className="flex w-16 shrink-0 flex-col items-center gap-1.5"
        >
          <span className="relative">
            <Avatar name={myName} size={60} src={profileQuery.data?.avatar_url} showOnline={false} />
            <span className="genz-gradient absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full ring-2 ring-bg">
              <Plus className="size-3.5 text-white" strokeWidth={3} />
            </span>
          </span>
          <span className="text-[11px] font-semibold text-ink">You</span>
        </button>

        {stories.map((snap) => {
          const name = snap.sender?.display_name ?? snap.sender?.username ?? "Someone";
          return (
            <button
              key={snap.id}
              onClick={() => setViewing(snap)}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span className="genz-gradient rounded-full p-[2.5px]">
                <span className="block rounded-full bg-bg p-[2px]">
                  <Avatar name={name} size={54} src={snap.sender?.avatar_url} showOnline={false} />
                </span>
              </span>
              <span className="max-w-full truncate text-[11px] font-semibold text-ink">{name}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {viewing && <SnapViewer snap={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </div>
  );
}
