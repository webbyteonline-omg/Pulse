"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Check, Copy, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/friends/OnlineIndicator";
import {
  isOverdue,
  summarize,
  useAddBorrowLend,
  useBorrowLend,
  useDeleteBorrowLend,
  useSettle,
} from "@/hooks/useBorrowLend";
import { useFriends } from "@/hooks/useFriends";
import { formatDate, formatINR, todayIST } from "@/lib/utils";
import type { BorrowLend, BorrowLendType } from "@/lib/supabase/types";

type Tab = "lent" | "borrowed" | "settled";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "lent", label: "Lent" },
  { id: "borrowed", label: "Borrowed" },
  { id: "settled", label: "Settled" },
];

export default function BorrowLendPage() {
  const router = useRouter();
  const entriesQuery = useBorrowLend();
  const settle = useSettle();
  const deleteEntry = useDeleteBorrowLend();
  const { data: friends } = useFriends();
  const [tab, setTab] = useState<Tab>("lent");
  const [showAdd, setShowAdd] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const entries = useMemo(() => entriesQuery.data ?? [], [entriesQuery.data]);
  const summary = summarize(entries);
  const friendByName = new Map(
    (friends ?? []).map((f) => [(f.display_name ?? f.username).toLowerCase(), f])
  );

  const filtered = useMemo(() => {
    if (tab === "settled") return entries.filter((e) => e.status === "settled");
    return entries.filter((e) => e.status === "pending" && e.type === tab);
  }, [entries, tab]);

  const remind = async (entry: BorrowLend) => {
    const message = `Hey ${entry.person_name}, just a reminder that you owe me ₹${Number(entry.amount).toFixed(0)}${entry.reason ? ` for ${entry.reason}` : ""} 😊`;
    try {
      await navigator.clipboard.writeText(message);
      setToast("Message copied — paste in WhatsApp");
    } catch {
      setToast("Couldn't copy — long-press to copy manually");
    }
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push("/finance")}
          aria-label="Back"
          className="p-2 -ml-2 min-h-[44px] min-w-[44px] rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Borrow / Lend</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Card className="p-4 border-success/30">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <ArrowDownLeft className="h-3.5 w-3.5" /> You&apos;ll Receive
          </p>
          <p className="mt-1.5 text-2xl font-black text-success tabular-nums">
            {formatINR(summary.toReceive)}
          </p>
        </Card>
        <Card className="p-4 border-danger/30">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-danger">
            <ArrowUpRight className="h-3.5 w-3.5" /> You Owe
          </p>
          <p className="mt-1.5 text-2xl font-black text-danger tabular-nums">
            {formatINR(summary.toPay)}
          </p>
        </Card>
      </div>
      <p className="text-center text-xs text-ink-dim mb-5">
        {summary.net === 0
          ? "All square with everyone 🤝"
          : summary.net > 0
            ? `Overall you're ${formatINR(summary.net)} ahead`
            : `Overall you owe ${formatINR(Math.abs(summary.net))}`}
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-1 clay-soft rounded-btn p-1 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-10 rounded-input text-xs font-bold transition-colors ${
              tab === t.id ? "clay-purple-btn" : "text-ink-dim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {entriesQuery.isLoading ? (
        <RowSkeleton rows={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          illustration="expenses"
          title={tab === "settled" ? "Nothing settled yet" : `Nothing ${tab}`}
          description={
            tab === "settled"
              ? "Settled entries land here — a clean history of squared-up money."
              : "Track money you've lent to friends or borrowed from them, with due dates and reminders."
          }
          actionLabel={tab !== "settled" ? "Add entry" : undefined}
          onAction={tab !== "settled" ? () => setShowAdd(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((entry, i) => {
              const friend = friendByName.get(entry.person_name.toLowerCase());
              const overdue = isOverdue(entry);
              const lent = entry.type === "lent";
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ delay: Math.min(0.2, 0.04 * i) }}
                >
                  <Card className={`p-4 ${overdue ? "border-danger/50" : ""}`}>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={entry.person_name}
                        size={40}
                        showOnline={false}
                        src={friend?.avatar_url}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold truncate">{entry.person_name}</p>
                          {overdue && (
                            <span className="text-[9px] font-black text-danger bg-danger-dim px-1.5 py-0.5 rounded-full shrink-0">
                              OVERDUE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-ink-dim truncate">
                          {entry.reason || (lent ? "You lent" : "You borrowed")}
                          {" · "}
                          {formatDate(entry.date)}
                          {entry.due_date ? ` · due ${formatDate(entry.due_date)}` : ""}
                        </p>
                      </div>
                      <p
                        className={`text-lg font-black tabular-nums shrink-0 ${
                          lent ? "text-success" : "text-danger"
                        }`}
                      >
                        {lent ? "+" : "−"}
                        {formatINR(Number(entry.amount))}
                      </p>
                    </div>

                    {entry.status === "pending" ? (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          className="flex-1"
                          loading={settle.isPending}
                          onClick={() => settle.mutate(entry.id)}
                        >
                          <Check className="h-3.5 w-3.5" /> Settle
                        </Button>
                        {lent && (
                          <Button size="sm" variant="secondary" className="flex-1" onClick={() => void remind(entry)}>
                            <Copy className="h-3.5 w-3.5" /> Remind
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[11px] text-success font-semibold">
                          ✓ Settled{entry.settled_at ? ` on ${formatDate(entry.settled_at.slice(0, 10))}` : ""}
                        </p>
                        <button
                          onClick={() => deleteEntry.mutate(entry.id)}
                          aria-label="Delete entry"
                          className="p-2 text-ink-faint hover:text-danger transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="clay fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2.5 text-xs font-bold whitespace-nowrap"
            role="status"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <FAB label="Add entry" onClick={() => setShowAdd(true)} icon={<Plus className="h-6 w-6" />} />
      <AddEntrySheet open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  );
}

function AddEntrySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addEntry = useAddBorrowLend();
  const { data: friends } = useFriends();
  const [type, setType] = useState<BorrowLendType>("lent");
  const [amount, setAmount] = useState("");
  const [person, setPerson] = useState("");
  const [personUserId, setPersonUserId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setType("lent");
      setAmount("");
      setPerson("");
      setPersonUserId(null);
      setReason("");
      setDueDate("");
      setError(null);
    }
  }, [open]);

  const suggestions = (friends ?? []).filter((f) => {
    const name = (f.display_name ?? f.username).toLowerCase();
    return person.trim().length >= 1 && name.includes(person.trim().toLowerCase()) && name !== person.trim().toLowerCase();
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return setError("Enter a valid amount.");
    if (!person.trim()) return setError("Who's the money with?");
    try {
      await addEntry.mutateAsync({
        type,
        person_name: person.trim(),
        person_user_id: personUserId,
        amount: amt,
        reason: reason.trim() || null,
        due_date: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add entry">
      <form onSubmit={submit} className="space-y-4">
        {/* Lent / Borrowed toggle */}
        <div className="flex items-center gap-1 clay-inset rounded-btn p-1">
          {(["lent", "borrowed"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 h-10 rounded-input text-xs font-bold transition-colors ${
                type === t
                  ? t === "lent"
                    ? "bg-success text-black"
                    : "bg-danger text-white"
                  : "text-ink-dim"
              }`}
            >
              {t === "lent" ? "I lent 💸" : "I borrowed 🤲"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="clay rounded-card p-4">
          <label htmlFor="bl-amount" className="block text-xs font-medium text-ink-dim mb-1.5">
            Amount
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-ink-dim">₹</span>
            <input
              id="bl-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-3xl font-black tracking-tight placeholder:text-ink-faint focus:outline-none"
              autoFocus
            />
          </div>
        </div>

        {/* Person with friend autocomplete */}
        <div className="relative">
          <Input
            label={type === "lent" ? "Who took it?" : "Who gave it?"}
            placeholder="Name"
            value={person}
            onChange={(e) => {
              setPerson(e.target.value);
              setPersonUserId(null);
            }}
            maxLength={50}
          />
          {suggestions.length > 0 && (
            <div className="clay absolute z-10 inset-x-0 top-full mt-1 rounded-input overflow-hidden">
              {suggestions.slice(0, 4).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setPerson(f.display_name ?? f.username);
                    setPersonUserId(f.id);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-card-hover transition-colors"
                >
                  <Avatar name={f.display_name ?? f.username} size={26} showOnline={false} src={f.avatar_url} />
                  <span className="text-sm font-medium">{f.display_name ?? f.username}</span>
                  <span className="text-[10px] text-ink-faint">@{f.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Reason (optional)"
          placeholder="Maggi, auto fare, movie ticket…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={100}
        />
        <Input
          label="Due date (optional)"
          type="date"
          min={todayIST()}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={addEntry.isPending}>
          Save
        </Button>
      </form>
    </Modal>
  );
}
