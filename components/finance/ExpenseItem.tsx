"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { CATEGORY_META, formatDate, formatINR } from "@/lib/utils";
import type { Expense } from "@/lib/supabase/types";

export function ExpenseItem({
  expense,
  onDelete,
  index = 0,
}: {
  expense: Expense;
  onDelete?: (id: string) => void;
  index?: number;
}) {
  const meta = CATEGORY_META[expense.category ?? "others"];
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
        <p className="text-[11px] text-ink-dim">
          {formatDate(expense.date)}
          {expense.note ? ` · ${expense.note}` : ""}
          {expense.source && expense.source !== "manual" ? ` · via ${expense.source}` : ""}
        </p>
      </div>
      <span className="text-sm font-bold tabular-nums shrink-0">
        −{formatINR(Number(expense.amount), { decimals: true })}
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
