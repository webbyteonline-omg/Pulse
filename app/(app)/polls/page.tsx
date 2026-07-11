"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SOCIAL_TABS, SubTabs } from "@/components/layout/SubTabs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { CreatePoll } from "@/components/polls/CreatePoll";
import { PollCard } from "@/components/polls/PollCard";
import { usePolls } from "@/hooks/usePolls";
import { useAuthStore } from "@/store/authStore";

type Tab = "active" | "mine" | "expired";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "active", label: "Active" },
  { id: "mine", label: "My polls" },
  { id: "expired", label: "Expired" },
];

export default function PollsPage() {
  const user = useAuthStore((s) => s.user);
  const pollsQuery = usePolls();
  const [tab, setTab] = useState<Tab>("active");
  const [showCreate, setShowCreate] = useState(false);

  const polls = useMemo(() => {
    const all = pollsQuery.data ?? [];
    if (tab === "active") return all.filter((p) => !p.expired);
    if (tab === "mine") return all.filter((p) => p.creator_id === user?.id);
    return all.filter((p) => p.expired);
  }, [pollsQuery.data, tab, user?.id]);

  return (
    <div>
      <Header
        title="Polls"
        subtitle="Live results as friends vote"
        action={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Poll
          </Button>
        }
      />
      <SubTabs tabs={SOCIAL_TABS} layoutId="social-tabs" />

      <div className="flex items-center gap-1 bg-card border border-line rounded-btn p-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-10 rounded-input text-xs font-bold transition-colors ${
              tab === t.id ? "bg-primary text-white" : "text-ink-dim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {pollsQuery.isLoading ? (
        <RowSkeleton rows={3} />
      ) : polls.length === 0 ? (
        <EmptyState
          illustration="generic"
          title={tab === "expired" ? "No expired polls" : "No polls yet"}
          description={
            tab === "mine"
              ? "Create a poll and every friend sees it instantly."
              : "When you or your friends create polls, they show up here with live results."
          }
          actionLabel={tab !== "expired" ? "Create a poll" : undefined}
          onAction={tab !== "expired" ? () => setShowCreate(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {polls.map((poll, i) => (
              <PollCard key={poll.id} poll={poll} index={i} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <FAB label="Create poll" onClick={() => setShowCreate(true)} />
      <CreatePoll open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
