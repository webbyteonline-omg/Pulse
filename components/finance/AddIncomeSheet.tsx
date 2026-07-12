"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAddIncome } from "@/hooks/useFinance";
import { incomeSchema } from "@/lib/schemas";
import { ALL_INCOME_SOURCES, INCOME_SOURCE_META, todayIST } from "@/lib/utils";
import type { IncomeSource } from "@/lib/supabase/types";

/** Bottom sheet: log income (Pocket Money / Part-time / Transfer / Other). */
export function AddIncomeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const addIncome = useAddIncome();
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState<IncomeSource>("pocket_money");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(todayIST());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setAmount("");
      setSource("pocket_money");
      setMerchant("");
      setDate(todayIST());
      setNote("");
      setError(null);
      setTimeout(() => amountRef.current?.focus(), 50);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = incomeSchema.safeParse({
      amount: Number(amount),
      category: source,
      merchant: merchant.trim() || null,
      note: note.trim() || null,
      date,
    });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.amount?.[0] ?? "Check the amount");
      return;
    }
    try {
      await addIncome.mutateAsync({
        amount: parsed.data.amount,
        source: parsed.data.category,
        merchant: parsed.data.merchant,
        note: parsed.data.note,
        date: parsed.data.date,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save income");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add income">
      <form onSubmit={submit} className="space-y-5">
        <div className="rounded-card bg-input border border-line p-5">
          <label htmlFor="income-amount" className="block text-xs font-medium text-ink-dim mb-2">
            Amount
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ink-dim">₹</span>
            <input
              ref={amountRef}
              id="income-amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-transparent text-4xl font-black tracking-tight placeholder:text-ink-faint focus:outline-none"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-ink-dim mb-2">Source</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_INCOME_SOURCES.map((s) => {
              const meta = INCOME_SOURCE_META[s];
              const active = source === s;
              return (
                <motion.button
                  key={s}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSource(s)}
                  className="flex items-center gap-2 rounded-btn border py-3 px-3 transition-colors"
                  style={{
                    backgroundColor: active ? `${meta.color}1f` : "rgb(var(--input))",
                    borderColor: active ? meta.color : "rgb(var(--line))",
                  }}
                >
                  <span className="text-lg" aria-hidden>
                    {meta.emoji}
                  </span>
                  <span
                    className="text-xs font-bold text-left"
                    style={{ color: active ? meta.color : "rgb(var(--ink-dim))" }}
                  >
                    {meta.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <Input
          label="From (optional)"
          placeholder="Mom, internship, …"
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayIST()} />
        <Input
          label="Note (optional)"
          placeholder="Monthly allowance"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" variant="success" size="lg" className="w-full" loading={addIncome.isPending}>
          Save income
        </Button>
      </form>
    </Modal>
  );
}
