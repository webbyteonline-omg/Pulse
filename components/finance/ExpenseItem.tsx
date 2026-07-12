"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Trash2 } from "lucide-react";
import { decryptJSON } from "@/lib/encryption";
import { CATEGORY_META, INCOME_SOURCE_META, formatDate, formatINR } from "@/lib/utils";
import type { Expense, ExpenseCategory, IncomeSource } from "@/lib/supabase/types";

/** Decrypt "enc:"-prefixed private notes on-device. */
function useDecryptedNote(note: string | null): { text: string | null; encrypted: boolean } {
  const encrypted = !!note?.startsWith("enc:");
  const [text, setText] = useState<string | null>(encrypted ? null : note);
  useEffect(() => {
    let mounted = true;
    if (encrypted && note) {
      void decryptJSON<string>(note.slice(4)).then((value) => {
        if (mounted) setText(value ?? "(locked — key missing)");
      });
    } else {
      setText(note);
    }
    return () => {
      mounted = false;
    };
  }, [note, encrypted]);
  return { text, encrypted };
}

export function ExpenseItem({
  expense,
  onDelete,
  index = 0,
}: {
  expense: Expense;
  onDelete?: (id: string) => void;
  index?: number;
}) {
  const isIncome = expense.transaction_type === "income";
  const meta = isIncome
    ? INCOME_SOURCE_META[(expense.category as IncomeSource | null) ?? "other_income"]
    : CATEGORY_META[(expense.category as ExpenseCategory | null) ?? "others"];
  const { text: note, encrypted } = useDecryptedNote(expense.note);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ delay: Math.min(0.25, 0.03 * index) }}
      className="flex items-center gap-3 px-4 py-3"
    >
      <div
        className="h-10 w-10 rounded-btn grid place-items-center text-base shrink-0"
        style={{ backgroundColor: `${meta.color}1f` }}
        aria-hidden
      >
        {meta.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {expense.merchant || meta.label}
        </p>
        <p className="text-[11px] text-ink-dim flex items-center gap-1 flex-wrap">
          {formatDate(expense.date)}
          {note && (
            <>
              {" · "}
              {encrypted && <Lock className="h-2.5 w-2.5 inline shrink-0" aria-label="Encrypted note" />}
              <span className="truncate max-w-[140px]">{note}</span>
            </>
          )}
          {expense.source && expense.source !== "manual" ? ` · via ${expense.source}` : ""}
        </p>
      </div>
      <span
        className={`text-sm font-bold tabular-nums shrink-0 ${isIncome ? "text-success" : "text-ink"}`}
      >
        {isIncome ? "+" : "−"}
        {formatINR(Number(expense.amount), { decimals: true })}
      </span>
      {onDelete && (
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => onDelete(expense.id)}
          aria-label="Delete expense"
          className="p-1.5 rounded-input text-ink-faint hover:text-danger hover:bg-danger-dim transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </motion.button>
      )}
    </motion.div>
  );
}
