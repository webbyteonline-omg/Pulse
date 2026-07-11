"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { CardSkeleton, RowSkeleton } from "@/components/ui/Skeleton";
import { CategoryDonut } from "@/components/finance/CategoryDonut";
import { BudgetBar } from "@/components/finance/BudgetBar";
import { ExpenseItem } from "@/components/finance/ExpenseItem";
import { useBudgets, useDeleteExpense, useExpenses } from "@/hooks/useFinance";
import { CATEGORY_META, formatINR, monthLabel, nowIST } from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";

export default function FinancePage() {
  const router = useRouter();
  const now = nowIST();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const expensesQuery = useExpenses(month, year);
  const budgetsQuery = useBudgets(month, year);
  const deleteExpense = useDeleteExpense();

  const expenses = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data]);
  const budgets = budgetsQuery.data ?? [];

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const remaining = totalBudget - total;
  const budgetPct = totalBudget > 0 ? Math.min(100, (total / totalBudget) * 100) : 0;

  const spentByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const e of expenses) {
      const cat = e.category ?? "others";
      map.set(cat, (map.get(cat) ?? 0) + Number(e.amount));
    }
    return map;
  }, [expenses]);

  const navigateMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  const loading = expensesQuery.isLoading || budgetsQuery.isLoading;

  return (
    <div>
      <Header
        title="Finance"
        action={
          <div className="flex gap-2">
            <Link href="/finance/budget">
              <Button variant="secondary" aria-label="Budgets">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/finance/add">
              <Button>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </Link>
          </div>
        }
      />

      {/* Month selector */}
      <div className="flex items-center justify-center gap-3 mb-5">
        <button
          onClick={() => navigateMonth(-1)}
          aria-label="Previous month"
          className="p-2 rounded-btn bg-card border border-line text-ink-dim hover:text-ink transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold w-40 text-center">{monthLabel(month, year)}</span>
        <button
          onClick={() => navigateMonth(1)}
          aria-label="Next month"
          className="p-2 rounded-btn bg-card border border-line text-ink-dim hover:text-ink transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton className="h-40" />
          <RowSkeleton rows={4} />
        </div>
      ) : expenses.length === 0 && budgets.length === 0 ? (
        <EmptyState
          illustration="expenses"
          title="No expenses this month"
          description="Log expenses manually, paste a UPI SMS, or upload a payment screenshot — Pulse categorizes them for you."
          actionLabel="Add first expense"
          onAction={() => router.push("/finance/add")}
        />
      ) : (
        <>
          {/* Total + budget */}
          <Card gradient className="p-5 mb-4">
            <p className="text-xs text-ink-dim">Spent in {monthLabel(month, year)}</p>
            <motion.p
              key={`${month}-${year}-${total}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-4xl font-black tracking-tighter"
            >
              {formatINR(total)}
            </motion.p>
            {totalBudget > 0 && (
              <>
                <div className="mt-4 h-2.5 rounded-full bg-line overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${budgetPct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        budgetPct < 65
                          ? "linear-gradient(90deg,#43D98C,#43D98C)"
                          : budgetPct < 90
                            ? "linear-gradient(90deg,#43D98C,#FFB347)"
                            : "linear-gradient(90deg,#FFB347,#FF5C5C)",
                    }}
                  />
                </div>
                <p className={`mt-2 text-xs font-semibold ${remaining < 0 ? "text-danger" : "text-ink-dim"}`}>
                  {remaining >= 0
                    ? `${formatINR(remaining)} left of ${formatINR(totalBudget)}`
                    : `${formatINR(Math.abs(remaining))} over budget`}
                </p>
              </>
            )}
          </Card>

          {/* Donut */}
          {expenses.length > 0 && (
            <Card className="p-4 mb-4">
              <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-2">
                By category
              </h2>
              <CategoryDonut expenses={expenses} />
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {[...spentByCategory.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, amount]) => (
                    <div key={category} className="flex items-center gap-2 text-xs">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_META[category].color }}
                      />
                      <span className="flex-1 text-ink-dim">{CATEGORY_META[category].label}</span>
                      <span className="font-semibold tabular-nums">{formatINR(amount)}</span>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Budget bars */}
          {budgets.length > 0 && (
            <Card className="p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">Budgets</h2>
                <Link href="/finance/budget" className="text-xs font-semibold text-primary hover:underline">
                  Edit
                </Link>
              </div>
              <div className="space-y-3.5">
                {budgets
                  .filter((b) => Number(b.amount) > 0)
                  .map((budget) => (
                    <BudgetBar
                      key={budget.id}
                      category={budget.category as ExpenseCategory}
                      spent={spentByCategory.get(budget.category as ExpenseCategory) ?? 0}
                      limit={Number(budget.amount)}
                    />
                  ))}
              </div>
            </Card>
          )}

          {/* Recent transactions */}
          {expenses.length > 0 && (
            <Card className="mb-4">
              <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider px-4 pt-4">
                Recent
              </h2>
              <div className="divide-y divide-line/60 mt-1">
                <AnimatePresence initial={false}>
                  {expenses.slice(0, 10).map((expense, i) => (
                    <ExpenseItem
                      key={expense.id}
                      expense={expense}
                      index={i}
                      onDelete={(id) => deleteExpense.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          )}

          {budgets.length === 0 && (
            <Link href="/finance/budget" className="block">
              <Card interactive className="p-4 text-center mb-4">
                <p className="text-sm font-semibold text-primary">Set monthly budgets →</p>
                <p className="text-xs text-ink-dim mt-0.5">Get alerts before you overspend</p>
              </Card>
            </Link>
          )}
        </>
      )}

      <FAB label="Add expense" onClick={() => router.push("/finance/add")} />
    </div>
  );
}
