"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { PAGE_SIZE, useActivityLog, type ActivityFilter } from "@/hooks/useActivity";
import { ACTIVITY_META, type ActivityAction } from "@/lib/activityLog";
import { formatINR } from "@/lib/utils";
import type { ActivityLog } from "@/lib/supabase/types";

const TYPE_FILTERS = [
  { id: null, label: "All" },
  { id: "attendance", label: "Attendance" },
  { id: "expense", label: "Expenses" },
  { id: "income", label: "Income" },
  { id: "subject", label: "Subjects" },
  { id: "event", label: "Events" },
  { id: "assignment", label: "Assignments" },
  { id: "quiz", label: "Quizzes" },
  { id: "exam", label: "Exams" },
  { id: "friend", label: "Friends" },
  { id: "poll", label: "Polls" },
];

function describe(log: ActivityLog): string {
  const v = (log.new_value ?? {}) as Record<string, unknown>;
  switch (log.action as ActivityAction) {
    case "attendance_marked":
      return `You marked ${v.status ?? "attendance"} in ${v.subject ?? "a subject"}`;
    case "expense_added":
      return `You added expense ${typeof v.amount === "number" ? formatINR(v.amount) : ""}${v.merchant ? ` at ${v.merchant}` : ""}`;
    case "expense_deleted":
      return "You deleted an expense";
    case "income_added":
      return `You logged income ${typeof v.amount === "number" ? formatINR(v.amount) : ""}${v.merchant ? ` from ${v.merchant}` : ""}`;
    case "subject_created":
      return `You added subject ${v.name ?? ""}`;
    case "subject_updated":
      return `You edited subject ${v.name ?? ""}`;
    case "subject_deleted":
      return "You deleted a subject";
    case "event_added":
      return `You added event ${v.title ?? ""}`;
    case "event_deleted":
      return "You deleted an event";
    case "events_imported":
      return `You imported ${v.count ?? "?"} events from a calendar PDF`;
    case "budget_changed":
      return `You set ${v.category ?? "a"} budget to ${typeof v.amount === "number" ? formatINR(v.amount) : ""}`;
    case "friend_added":
      return "You added a friend";
    case "friend_removed":
      return "You removed a friend";
    case "friend_request_sent":
      return "You sent a friend request";
    case "poll_created":
      return `You created a poll${v.question ? `: "${v.question}"` : ""}`;
    case "poll_voted":
      return "You voted on a poll";
    case "checkin":
      return `Daily check-in${v.mood ? ` — mood ${v.mood}/5` : ""}${v.steps ? `, ${v.steps} steps` : ""}`;
    case "assignment_added":
      return `You added assignment ${v.title ?? ""}`;
    case "assignment_updated":
      return `You updated assignment ${v.title ?? ""}`;
    case "assignment_deleted":
      return "You deleted an assignment";
    case "quiz_added":
      return `You added quiz ${v.title ?? ""}`;
    case "quiz_updated":
      return `You updated quiz ${v.title ?? ""}`;
    case "quiz_deleted":
      return "You deleted a quiz";
    case "exam_added":
      return `You added exam ${v.title ?? ""}`;
    case "exam_updated":
      return `You updated exam ${v.title ?? ""}`;
    case "exam_deleted":
      return "You deleted an exam";
    case "rate_limit_hit":
      return `Rate limit reached (${log.entity_type})`;
    default:
      return log.action.replace(/_/g, " ");
  }
}

function when(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - date.getTime()) / 86_400_000);
  const time = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(date);
  if (diffDays === 0) return `today ${time}`;
  if (diffDays === 1) return `yesterday ${time}`;
  return `${new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }).format(date)} ${time}`;
}

export default function ActivityPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<ActivityFilter>({ type: null, from: null, to: null });
  const activityQuery = useActivityLog(page, filter);

  const rows = activityQuery.data?.rows ?? [];
  const total = activityQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const updateFilter = (updates: Partial<ActivityFilter>) => {
    setFilter((f) => ({ ...f, ...updates }));
    setPage(0);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push("/profile")}
          aria-label="Back"
          className="p-2 -ml-2 min-h-[44px] min-w-[44px] rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold">My Activity</h1>
          <p className="text-xs text-ink-dim">Immutable audit trail — {total} entries</p>
        </div>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mb-3">
        {TYPE_FILTERS.map((t) => (
          <button
            key={t.label}
            onClick={() => updateFilter({ type: t.id })}
            className={`shrink-0 min-h-[44px] px-3.5 rounded-full text-xs font-bold border transition-colors ${
              filter.type === t.id
                ? "bg-primary-dim border-primary text-primary"
                : "border-line text-ink-dim"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Input
          label="From"
          type="date"
          value={filter.from ?? ""}
          onChange={(e) => updateFilter({ from: e.target.value || null })}
        />
        <Input
          label="To"
          type="date"
          value={filter.to ?? ""}
          onChange={(e) => updateFilter({ to: e.target.value || null })}
        />
      </div>

      {activityQuery.isLoading ? (
        <RowSkeleton rows={5} />
      ) : rows.length === 0 ? (
        <EmptyState
          illustration="generic"
          title="No activity yet"
          description="Everything you do in DockIn — marking attendance, adding expenses, creating polls — gets recorded here."
        />
      ) : (
        <>
          <Card className="divide-y divide-line/60">
            <AnimatePresence initial={false}>
              {rows.map((log, i) => {
                const meta = ACTIVITY_META[log.action as ActivityAction] ?? {
                  emoji: "•",
                  label: log.entity_type,
                };
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(0.2, i * 0.02) }}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <span className="text-base shrink-0 mt-0.5" aria-hidden>
                      {meta.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{describe(log)}</p>
                      <p className="text-[11px] text-ink-faint mt-0.5">{when(log.created_at)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label="Previous page"
              className="h-11 w-11 grid place-items-center rounded-btn clay text-ink-dim disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-ink-dim">
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label="Next page"
              className="h-11 w-11 grid place-items-center rounded-btn clay text-ink-dim disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
