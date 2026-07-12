"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  HandCoins,
  ScanLine,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { Button } from "@/components/ui/Button";
import { CardSkeleton, RowSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { BudgetBar } from "@/components/finance/BudgetBar";
import { ExpenseItem } from "@/components/finance/ExpenseItem";
import { UdharSection } from "@/components/finance/UdharSection";
import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { summarize, useBorrowLend } from "@/hooks/useBorrowLend";
import { useBudgets, useDeleteExpense, useExpenses } from "@/hooks/useFinance";
import { ALL_CATEGORIES, CATEGORY_META, downloadCSV, formatINR, monthLabel, nowIST } from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/supabase/types";

const CategoryDonut = dynamic(
  () => import("@/components/finance/CategoryDonut").then((m) => m.CategoryDonut),
  { ssr: false, loading: () => <Skeleton className="h-52 w-full rounded-card" /> }
);

type Tab = "overview" | "transactions" | "udhar";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "udhar", label: "Udhar" },
];

type CategoryFilter = "all" | ExpenseCategory;

export default function FinancePage() {
  const router = useRouter();
  const now = nowIST();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [prevMonth, setPrevMonth] = useState(now.getMonth() === 0 ? 12 : now.getMonth());
  const [prevYear] = useState(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [tab, setTab] = useState<Tab>("overview");
  const [hideBalance, setHideBalance] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const expensesQuery = useExpenses(month, year);
  const prevExpensesQuery = useExpenses(prevMonth, prevYear);
  const budgetsQuery = useBudgets(month, year);
  const deleteExpense = useDeleteExpense();
  const { data: borrowLendEntries } = useBorrowLend();

  // Income tracking was removed — this table may still carry legacy income
  // rows from testing, so we defensively filter them out everywhere.
  const expenses = useMemo(
    () => (expensesQuery.data ?? []).filter((e) => e.transaction_type !== "income"),
    [expensesQuery.data]
  );
  const prevExpenses = useMemo(
    () => (prevExpensesQuery.data ?? []).filter((e) => e.transaction_type !== "income"),
    [prevExpensesQuery.data]
  );
  const budgets = budgetsQuery.data ?? [];

  const filteredTransactions = useMemo(() => {
    if (categoryFilter === "all") return expenses;
    return expenses.filter((e) => (e.category ?? "others") === categoryFilter);
  }, [expenses, categoryFilter]);

  const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const prevSpent = prevExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const spentDelta = prevSpent > 0 ? Math.round(((spent - prevSpent) / prevSpent) * 100) : null;
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);

  const spentByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const e of expenses) {
      const cat = (e.category as ExpenseCategory | null) ?? "others";
      map.set(cat, (map.get(cat) ?? 0) + Number(e.amount));
    }
    return map;
  }, [expenses]);

  const udharSummary = summarize(borrowLendEntries ?? []);

  const navigateMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; } else if (m > 12) { m = 1; y += 1; }
    setMonth(m); setYear(y);
    let pm = m - 1;
    if (pm < 1) pm = 12;
    setPrevMonth(pm);
  };

  const loading = expensesQuery.isLoading || budgetsQuery.isLoading;
  const hide = (v: string) => (hideBalance ? "₹ ••••" : v);

  return (
    <div>
      <Header title="Finance" showBell />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 min-h-[44px] px-4 rounded-full text-xs font-bold transition-colors ${
              tab === t.id ? "bg-primary text-white" : "bg-card border border-line text-ink-dim"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab !== "udhar" && (
        <div className="flex items-center justify-center gap-3 mb-4">
          <button onClick={() => navigateMonth(-1)} aria-label="Previous month" className="p-2.5 rounded-btn bg-card border border-line text-ink-dim">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold w-40 text-center">{monthLabel(month, year)}</span>
          <button onClick={() => navigateMonth(1)} aria-label="Next month" className="p-2.5 rounded-btn bg-card border border-line text-ink-dim">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading && tab !== "udhar" ? (
        <div className="space-y-4">
          <CardSkeleton className="h-44" />
          <RowSkeleton rows={4} />
        </div>
      ) : (
        <>
          {tab === "overview" && (
            <>
              {/* Total Spent gradient card */}
              <div className="relative overflow-hidden rounded-hero p-5 mb-4 bg-pulse-gradient text-white">
                <div aria-hidden className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
                <button
                  onClick={() => setHideBalance((v) => !v)}
                  className="flex items-center gap-1.5 text-sm font-semibold opacity-90"
                >
                  Total Spent This Month {hideBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <motion.p
                  key={`${month}-${year}-${spent}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-4xl font-black tracking-tight tabular-nums"
                >
                  {hide(formatINR(spent))}
                </motion.p>
                {spentDelta !== null && (
                  <p className="mt-2 text-xs opacity-85">
                    vs last month: {hide(formatINR(prevSpent))}{" "}
                    {spentDelta === 0 ? "· no change" : spentDelta > 0 ? `↑${spentDelta}%` : `↓${Math.abs(spentDelta)}%`}
                  </p>
                )}
              </div>

              {expenses.length === 0 && budgets.length === 0 ? (
                <EmptyState
                  illustration="expenses"
                  title="No expenses this month"
                  description="Log manually, paste a UPI SMS, or scan a payment screenshot."
                  actionLabel="Add first expense"
                  onAction={() => router.push("/finance/add")}
                />
              ) : (
                <>
                  {expenses.length > 0 && (
                    <Card className="p-4 mb-4">
                      <h2 className="text-lg font-semibold mb-2">Spending Breakdown</h2>
                      <CategoryDonut expenses={expenses} />
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {[...spentByCategory.entries()].sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                          <div key={cat} className="flex items-center gap-2 text-xs">
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_META[cat].color }} />
                            <span className="flex-1 text-ink-dim">{CATEGORY_META[cat].label}</span>
                            <span className="font-semibold tabular-nums">{formatINR(amount)}</span>
                            <span className="text-ink-faint tabular-nums w-9 text-right">
                              {spent > 0 ? Math.round((amount / spent) * 100) : 0}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {budgets.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold">Budget Overview</h2>
                        <Link href="/finance/budget" className="text-xs font-semibold text-primary">Edit Budget</Link>
                      </div>
                      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
                        {budgets.filter((b) => Number(b.amount) > 0).map((b) => (
                          <Card key={b.id} className="p-3.5 w-44 shrink-0">
                            <BudgetBar
                              category={b.category as ExpenseCategory}
                              spent={spentByCategory.get(b.category as ExpenseCategory) ?? 0}
                              limit={Number(b.amount)}
                            />
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {expenses.length > 0 && (
                    <Card className="mb-4">
                      <div className="flex items-center justify-between px-4 pt-4">
                        <h2 className="text-lg font-semibold">Recent</h2>
                        <button onClick={() => setTab("transactions")} className="text-xs font-semibold text-primary">See all →</button>
                      </div>
                      <div className="divide-y divide-line/60 mt-1">
                        <AnimatePresence initial={false}>
                          {expenses.slice(0, 5).map((expense, i) => (
                            <ExpenseItem key={expense.id} expense={expense} index={i} onDelete={(id) => deleteExpense.mutate(id)} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </Card>
                  )}

                  {/* Udhar summary card */}
                  <Link href="/finance/borrow" className="block mb-4">
                    <Card interactive className="p-4 flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-btn bg-warning-dim grid place-items-center shrink-0">
                        <HandCoins className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-ink-dim">
                          You are owed: <span className="font-bold text-success">{formatINR(udharSummary.toReceive)}</span>
                        </p>
                        <p className="text-xs text-ink-dim mt-0.5">
                          You owe: <span className="font-bold text-danger">{formatINR(udharSummary.toPay)}</span>
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-primary shrink-0">See details →</span>
                    </Card>
                  </Link>
                </>
              )}

              <SpendingSummary expenses={expenses} budgets={budgets} />

              <Button
                variant="secondary"
                className="w-full mb-4"
                onClick={() =>
                  downloadCSV(`pulse-expenses-${year}-${String(month).padStart(2, "0")}.csv`,
                    expenses.map((e) => ({
                      date: e.date, amount: e.amount, category: e.category ?? "others",
                      merchant: e.merchant ?? "", source: e.source ?? "manual",
                    })))
                }
              >
                <Download className="h-4 w-4" /> Export {monthLabel(month, year)} (CSV)
              </Button>
            </>
          )}

          {tab === "transactions" && (
            <>
              {/* Category filter row */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 mb-4">
                <button
                  onClick={() => setCategoryFilter("all")}
                  className={`shrink-0 min-h-[36px] px-3.5 rounded-full text-xs font-bold border transition-colors ${
                    categoryFilter === "all" ? "bg-primary text-white border-primary" : "bg-card border-line text-ink-dim"
                  }`}
                >
                  All
                </button>
                {ALL_CATEGORIES.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className="shrink-0 min-h-[36px] px-3.5 rounded-full text-xs font-bold border transition-colors"
                      style={{
                        backgroundColor: active ? `${meta.color}26` : "transparent",
                        borderColor: active ? meta.color : "rgb(var(--line))",
                        color: active ? meta.color : "rgb(var(--ink-dim))",
                      }}
                    >
                      {meta.emoji} {meta.label}
                    </button>
                  );
                })}
              </div>

              {filteredTransactions.length === 0 ? (
                <EmptyState
                  illustration="expenses"
                  title="No transactions"
                  description={categoryFilter !== "all" ? "No transactions match this filter." : "Everything you log this month shows up here."}
                  actionLabel="Add expense"
                  onAction={() => router.push("/finance/add")}
                />
              ) : (
                <Card>
                  <div className="divide-y divide-line/60">
                    <AnimatePresence initial={false}>
                      {filteredTransactions.map((expense, i) => (
                        <ExpenseItem key={expense.id} expense={expense} index={i} onDelete={(id) => deleteExpense.mutate(id)} />
                      ))}
                    </AnimatePresence>
                  </div>
                </Card>
              )}
            </>
          )}

          {tab === "udhar" && <UdharSection />}

          {tab !== "udhar" && (
            <>
              {/* Quick Add bar (above bottom nav) */}
              <div className="fixed bottom-[76px] inset-x-0 z-30 md:static md:mt-4 px-4 pb-2 pointer-events-none">
                <div className="pointer-events-auto max-w-3xl mx-auto flex items-center gap-2">
                  <Link
                    href="/finance/add"
                    className="flex-1 flex items-center justify-center gap-1.5 h-12 rounded-full bg-primary text-white text-sm font-bold"
                  >
                    <ArrowUpRight className="h-4 w-4" /> Add Expense
                  </Link>
                  <Link
                    href="/finance/borrow"
                    className="shrink-0 flex items-center justify-center gap-1.5 h-12 px-4 rounded-full border border-line bg-card text-ink-dim text-sm font-bold"
                  >
                    <HandCoins className="h-4 w-4" /> Udhar
                  </Link>
                </div>
              </div>
              <div className="h-16 md:hidden" />
            </>
          )}
        </>
      )}

      {tab === "overview" && <FAB label="Add expense" onClick={() => router.push("/finance/add")} />}
    </div>
  );
}
