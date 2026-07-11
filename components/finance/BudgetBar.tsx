"use client";

import { motion } from "framer-motion";
import { CATEGORY_META, formatINR } from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/supabase/types";

export function BudgetBar({
  category,
  spent,
  limit,
}: {
  category: ExpenseCategory;
  spent: number;
  limit: number;
}) {
  const meta = CATEGORY_META[category];
  const pct = limit > 0 ? Math.min(100, (spent / limit) * 100) : 0;
  const over = limit > 0 && spent > limit;
  const barColor = over ? "#FF5C5C" : pct >= 80 ? "#FFB347" : meta.color;

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="font-semibold flex items-center gap-1.5">
          <span aria-hidden>{meta.emoji}</span> {meta.label}
        </span>
        <span className={`tabular-nums ${over ? "text-danger font-bold" : "text-ink-dim"}`}>
          {formatINR(spent)} / {formatINR(limit)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-line overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
