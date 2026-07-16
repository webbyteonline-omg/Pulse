"use client";

import Link from "next/link";
import { useFriends } from "@/hooks/useFriends";
import { useRealtime } from "@/lib/realtime";

/** Broadcast bar — dark gradient card surfacing who's online to hang out right now. */
export function WhosFreeBar() {
  const friendsQuery = useFriends();
  const { onlineIds } = useRealtime();
  const friends = friendsQuery.data ?? [];
  const online = friends.filter((f) => onlineIds.has(f.id));
  const names = online.slice(0, 3).map((f) => f.display_name?.split(" ")[0] ?? f.username);

  return (
    <div className="relative mb-5 overflow-hidden rounded-clay bg-[#1a1225] px-4 py-4 text-white">
      <span
        aria-hidden
        className="genz-gradient absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-40 blur-2xl"
      />
      {online.length > 0 && (
        <span className="absolute right-4 top-4 rounded-full bg-danger px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
          Live
        </span>
      )}
      <p className="text-[15px] font-extrabold">Who&apos;s free right now?</p>
      <p className="mt-1 text-xs leading-relaxed text-white/70">
        {online.length > 0
          ? `${online.length} ${online.length === 1 ? "friend is" : "friends are"} free — ${names.join(", ")}`
          : "Sab so rahe hain kya? 💤"}
      </p>
      <Link
        href="/friends"
        className="genz-gradient mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black"
      >
        I&apos;m free
      </Link>
    </div>
  );
}
