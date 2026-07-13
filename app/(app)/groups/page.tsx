"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { GroupSearchBar } from "@/components/groups/GroupSearchBar";
import { GroupCardWithRank } from "@/components/groups/GroupCardWithRank";
import { ConfessionFeed } from "@/components/groups/ConfessionFeed";
import { useMyGroups } from "@/hooks/useGroups";
import { usePolls } from "@/hooks/usePolls";

type Tab = "groups" | "confessions";

export default function GroupsPage() {
  const router = useRouter();
  const groupsQuery = useMyGroups();
  const pollsQuery = usePolls();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("groups");

  const groups = groupsQuery.data ?? [];
  const openPolls = (pollsQuery.data ?? []).length;
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(term));
  }, [groups, search]);

  return (
    <div>
      <Header title="Groups" showBell />

      {/* Segmented tabs */}
      <div className="mb-4 flex items-center gap-1 clay rounded-btn p-1">
        {(
          [
            { id: "groups" as const, label: "My Groups" },
            { id: "confessions" as const, label: "Confessions" },
          ]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-10 grid place-items-center rounded-input text-xs font-bold transition-colors ${
              tab === t.id ? "clay-purple-btn" : "text-ink-dim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "confessions" ? (
        <ConfessionFeed />
      ) : (
        <>
          {/* Active polls */}
          <Link href="/polls" className="clay mb-4 flex items-center gap-3 rounded-card px-4 py-3">
            <span className="clay-purple-btn flex size-9 shrink-0 items-center justify-center rounded-full">
              <BarChart3 style={{ height: 18, width: 18 }} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-ink">Active Polls</span>
              <span className="block text-xs text-ink-dim">
                {openPolls > 0 ? `${openPolls} running — cast your vote` : "Create a poll for your squad"}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-ink-faint" />
          </Link>

          <div className="mb-4">
            <GroupSearchBar value={search} onChange={setSearch} />
          </div>

          {groupsQuery.isLoading ? (
            <RowSkeleton rows={3} />
          ) : groups.length === 0 ? (
            <EmptyState
              illustration="generic"
              title="No groups yet"
              description="Create a group with your friends to track attendance, run polls and share a leaderboard."
              actionLabel="Create your first group"
              onAction={() => router.push("/groups/create")}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((group) => (
                <GroupCardWithRank key={group.id} group={group} />
              ))}
              {filtered.length === 0 && (
                <p className="py-6 text-center text-sm text-ink-dim">No groups match &quot;{search}&quot;.</p>
              )}
            </div>
          )}
        </>
      )}

      {tab === "groups" && <FAB label="Create group" onClick={() => router.push("/groups/create")} />}
    </div>
  );
}
