"use client";

import Link from "next/link";
import { Plus, Users2 } from "lucide-react";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { useMyGroups } from "@/hooks/useGroups";

const NEW_WINDOW_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

/** Compact "your groups" strip on the social feed. */
export function GroupActivity() {
  const groupsQuery = useMyGroups();
  const groups = groupsQuery.data ?? [];

  if (groupsQuery.isLoading) return null;

  return (
    <div className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
          <Users2 className="size-4 text-clay-purple" /> Your Groups
        </h2>
        <Link href="/groups" className="text-xs font-semibold text-clay-purple">
          See all
        </Link>
      </div>

      {groups.length === 0 ? (
        <Link href="/groups/create" className="clay flex items-center gap-3 rounded-card px-4 py-3.5">
          <span className="genz-gradient flex size-10 items-center justify-center rounded-full">
            <Plus className="size-5 text-white" strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Akela? Gang banao 🤙</p>
            <p className="text-xs text-ink-dim">Squad up with your friends.</p>
          </div>
        </Link>
      ) : (
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {groups.map((g) => {
            const isNew = Date.now() - new Date(g.created_at).getTime() < NEW_WINDOW_MS;
            return (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="clay relative flex w-28 shrink-0 flex-col items-center gap-2 rounded-card p-3"
              >
                {isNew && (
                  <span className="absolute right-2 top-2 rounded-full bg-accent px-1.5 py-0.5 text-[8px] font-black text-white">
                    NEW
                  </span>
                )}
                <GroupAvatar group={g} size={48} />
                <span className="max-w-full truncate text-xs font-bold text-ink">{g.name}</span>
                <span className="text-[11px] text-ink-dim">{g.memberCount} members</span>
              </Link>
            );
          })}
          <Link
            href="/groups/create"
            className="clay-inset flex w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-card p-3 text-ink-dim"
          >
            <span className="genz-gradient flex size-10 items-center justify-center rounded-full">
              <Plus className="size-5 text-white" strokeWidth={2.4} />
            </span>
            <span className="text-xs font-semibold">New</span>
          </Link>
        </div>
      )}
    </div>
  );
}
