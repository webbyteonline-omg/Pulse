"use client";

import Link from "next/link";
import { Plus, Users2 } from "lucide-react";
import { GroupAvatar } from "@/components/groups/GroupAvatar";
import { useMyGroups } from "@/hooks/useGroups";

/** Compact "your groups" strip on the social feed. */
export function GroupActivity() {
  const groupsQuery = useMyGroups();
  const groups = groupsQuery.data ?? [];

  if (groupsQuery.isLoading) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
          <Users2 className="size-4 text-clay-purple" /> Your Groups
        </h2>
        <Link href="/groups" className="text-xs font-semibold text-clay-purple">
          See all
        </Link>
      </div>

      {groups.length === 0 ? (
        <Link href="/groups/create" className="clay flex items-center gap-3 rounded-card px-4 py-3.5">
          <span className="clay-purple-btn flex size-10 items-center justify-center rounded-full">
            <Plus className="size-5" strokeWidth={2.4} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Create your first group</p>
            <p className="text-xs text-ink-dim">Squad up — polls, leaderboards &amp; more.</p>
          </div>
        </Link>
      ) : (
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4">
          {groups.map((g) => (
            <Link
              key={g.id}
              href={`/groups/${g.id}`}
              className="clay flex w-28 shrink-0 flex-col items-center gap-2 rounded-card p-3"
            >
              <GroupAvatar group={g} size={48} />
              <span className="max-w-full truncate text-xs font-bold text-ink">{g.name}</span>
              <span className="text-[11px] text-ink-dim">{g.memberCount} members</span>
            </Link>
          ))}
          <Link
            href="/groups/create"
            className="clay-inset flex w-28 shrink-0 flex-col items-center justify-center gap-2 rounded-card p-3 text-ink-dim"
          >
            <span className="clay-purple-btn flex size-10 items-center justify-center rounded-full">
              <Plus className="size-5" strokeWidth={2.4} />
            </span>
            <span className="text-xs font-semibold">New</span>
          </Link>
        </div>
      )}
    </div>
  );
}
