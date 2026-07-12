"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { GroupSearchBar } from "@/components/groups/GroupSearchBar";
import { GroupCardWithRank } from "@/components/groups/GroupCardWithRank";
import { useMyGroups } from "@/hooks/useGroups";

export default function GroupsPage() {
  const groupsQuery = useMyGroups();
  const [search, setSearch] = useState("");

  const groups = groupsQuery.data ?? [];
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(term));
  }, [groups, search]);

  return (
    <div>
      <Header
        title="Groups"
        mobileAction={
          <Link
            href="/groups/create"
            aria-label="Create group"
            className="grid place-items-center h-9 w-9 rounded-full bg-primary text-white"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
        action={
          <Link
            href="/groups/create"
            aria-label="Create group"
            className="hidden md:grid place-items-center h-9 w-9 rounded-full bg-primary text-white"
          >
            <Plus className="h-5 w-5" />
          </Link>
        }
      />

      <div className="mb-4">
        <GroupSearchBar value={search} onChange={setSearch} />
      </div>

      {groupsQuery.isLoading ? (
        <RowSkeleton rows={3} />
      ) : groups.length === 0 ? (
        <EmptyState
          illustration="generic"
          title="No groups yet"
          description="Create a group with your friends to track attendance, assignments and a shared leaderboard together."
          actionLabel="Create your first group"
          onAction={() => {
            window.location.href = "/groups/create";
          }}
        />
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {filtered.map((group) => (
              <GroupCardWithRank key={group.id} group={group} />
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-ink-dim py-6">No groups match &quot;{search}&quot;.</p>
            )}
          </div>

          <Link
            href="/groups/create"
            className="flex items-center justify-center gap-2 p-4 rounded-card border border-dashed border-line text-primary text-sm font-semibold hover:bg-card transition-colors"
          >
            <Plus className="h-4 w-4" /> Create new group
          </Link>
        </>
      )}
    </div>
  );
}
