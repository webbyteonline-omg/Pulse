"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { BudgetBar } from "@/components/finance/BudgetBar";
import { useBudgets, useExpenses, useSetBudget } from "@/hooks/useFinance";
import { ALL_CATEGORIES, CATEGORY_META, formatINR, monthLabel, nowIST } from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/supabase/types";

export default function BudgetPage() {
  const router = useRouter();
  const now = nowIST();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const budgetsQuery = useBudgets(month, year);
  const expensesQuery = useExpenses(month, year);
  const setBudget = useSetBudget(month, year);

  const [values, setValues] = useState<Record<string, string>>({});
  const [savedCategory, setSavedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (budgetsQuery.data) {
      const next: Record<string, string> = {};
      for (const b of budgetsQuery.data) {
        next[b.category] = String(Number(b.amount));
      }
      setValues((prev) => ({ ...next, ...prev }));
    }
  }, [budgetsQuery.data]);

  const spentByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const e of expensesQuery.data ?? []) {
      const cat = e.category ?? "others";
      map.set(cat, (map.get(cat) ?? 0) + Number(e.amount));
    }
    return map;
  }, [expensesQuery.data]);

  const save = async (category: ExpenseCategory) => {
    const amount = Number(values[category] ?? 0);
    if (!Number.isFinite(amount) || amount < 0) return;
    await setBudget.mutateAsync({ category, amount });
    setSavedCategory(category);
    setTimeout(() => setSavedCategory((c) => (c === category ? null : c)), 1500);
  };

  const totalBudget = ALL_CATEGORIES.reduce(
    (sum, c) => sum + (Number(values[c]) || 0),
    0
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push("/finance")}
          aria-label="Back"
          className="p-2 -ml-2 rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold">Monthly budgets</h1>
          <p className="text-xs text-ink-dim">
            {monthLabel(month, year)} · total {formatINR(totalBudget)}
          </p>
        </div>
      </div>

      {budgetsQuery.isLoading ? (
        <RowSkeleton rows={5} />
      ) : (
        <div className="space-y-3">
          {ALL_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const spent = spentByCategory.get(category) ?? 0;
            const limit = Number(values[category]) || 0;
            return (
              <Card key={category} className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-btn grid place-items-center text-base shrink-0"
                    style={{ backgroundColor: `${meta.color}1f` }}
                    aria-hidden
                  >
                    {meta.emoji}
                  </div>
                  <span className="flex-1 font-semibold text-sm">{meta.label}</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-dim">
                      ₹
                    </span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      placeholder="0"
                      aria-label={`${meta.label} budget`}
                      value={values[category] ?? ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [category]: e.target.value }))
                      }
                      onBlur={() => void save(category)}
                      className="w-28 h-10 pl-7 pr-3 rounded-input bg-bg border border-line text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  {savedCategory === category && (
                    <Check className="h-4 w-4 text-success shrink-0" aria-label="Saved" />
                  )}
                </div>
                {limit > 0 && (
                  <div className="mt-3">
                    <BudgetBar category={category} spent={spent} limit={limit} />
                  </div>
                )}
              </Card>
            );
          })}

          <p className="text-xs text-ink-faint text-center pt-2">
            Budgets save automatically when you leave a field.
          </p>
          <Button variant="secondary" className="w-full" onClick={() => router.push("/finance")}>
            Done
          </Button>
        </div>
      )}
    </div>
  );
}
