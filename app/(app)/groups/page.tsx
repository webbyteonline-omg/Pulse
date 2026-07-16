"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { GroupSearchBar } from "@/components/groups/GroupSearchBar";
import { GroupCardWithRank } from "@/components/groups/GroupCardWithRank";
import { ConfessionFeed } from "@/components/groups/ConfessionFeed";
import { useMyGroups } from "@/hooks/useGroups";

type Tab = "groups" | "confessions";

export default function GroupsPage() {
  const router = useRouter();
  const groupsQuery = useMyGroups();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("groups");

  const groups = groupsQuery.data ?? [];
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
          <div className="mb-4">
            <GroupSearchBar value={search} onChange={setSearch} />
          </div>

          {groupsQuery.isLoading ? (
            <RowSkeleton rows={3} />
          ) : groups.length === 0 ? (
            <EmptyState
              illustration="generic"
              title="Akela? Gang banao 🤙"
              description="Ek group bana apni gang ke saath — attendance track karo, saath mein rho."
              actionLabel="Gang banao"
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
