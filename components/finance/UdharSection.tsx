"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { summarize, useBorrowLend, useSettle } from "@/hooks/useBorrowLend";
import { formatDate, formatINR } from "@/lib/utils";
import type { BorrowLend } from "@/lib/supabase/types";

/** Inline "Borrowed & Lent" tab for the Finance page. Full history, adding
 * entries, and reminders live on the dedicated /finance/borrow page — this
 * is the at-a-glance settle view. */
export function UdharSection() {
  const entriesQuery = useBorrowLend();
  const settle = useSettle();

  const entries = useMemo(() => entriesQuery.data ?? [], [entriesQuery.data]);
  const pending = useMemo(() => entries.filter((e) => e.status === "pending"), [entries]);
  const theyOweYou = useMemo(() => pending.filter((e) => e.type === "lent"), [pending]);
  const youOweThem = useMemo(() => pending.filter((e) => e.type === "borrowed"), [pending]);
  const summary = summarize(entries);

  if (entriesQuery.isLoading) return <RowSkeleton rows={3} />;

  if (pending.length === 0) {
    return (
      <EmptyState
        illustration="generic"
        title="All settled up! 🎉"
        description="No pending borrow/lend entries with friends right now."
        actionLabel="Open Borrow & Lend"
        onAction={() => {
          window.location.href = "/finance/borrow";
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">They owe you</h2>
          {summary.toReceive > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-success-dim text-success text-xs font-bold">
              {formatINR(summary.toReceive)}
            </span>
          )}
        </div>
        {theyOweYou.length === 0 ? (
          <p className="text-xs text-ink-faint">Nobody owes you right now.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {theyOweYou.map((entry) => (
                <UdharRow key={entry.id} entry={entry} tone="success" onSettle={() => settle.mutate(entry.id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">You owe</h2>
          {summary.toPay > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-danger-dim text-danger text-xs font-bold">
              {formatINR(summary.toPay)}
            </span>
          )}
        </div>
        {youOweThem.length === 0 ? (
          <p className="text-xs text-ink-faint">You don&apos;t owe anyone right now.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {youOweThem.map((entry) => (
                <UdharRow key={entry.id} entry={entry} tone="danger" onSettle={() => settle.mutate(entry.id)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <Link href="/finance/borrow" className="block text-center text-xs font-semibold text-primary pt-1">
        Open full Borrow & Lend history →
      </Link>
    </div>
  );
}

function UdharRow({
  entry,
  tone,
  onSettle,
}: {
  entry: BorrowLend;
  tone: "success" | "danger";
  onSettle: () => void;
}) {
  const color = tone === "success" ? "#43D98C" : "#FF5C5C";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex items-center gap-3 clay rounded-card p-3.5"
    >
      <Avatar name={entry.person_name} userId={entry.person_user_id ?? undefined} size={40} showOnline={false} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{entry.person_name}</p>
        <p className="text-[11px] text-ink-dim truncate">
          {entry.reason ?? "No reason given"} · {formatDate(entry.date)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-black tabular-nums" style={{ color }}>
          {formatINR(Number(entry.amount))}
        </p>
        <button
          onClick={onSettle}
          className="mt-1 flex items-center gap-1 text-[10px] font-bold text-ink-dim hover:text-ink transition-colors"
        >
          <Check className="h-3 w-3" /> Mark Settled
        </button>
      </div>
    </motion.div>
  );
}
