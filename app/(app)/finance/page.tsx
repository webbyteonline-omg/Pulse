"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  ScanLine,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FAB } from "@/components/ui/FAB";
import { Button } from "@/components/ui/Button";
import { CardSkeleton, RowSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { BorrowLendCard } from "@/components/finance/BorrowLendCard";
import { BudgetBar } from "@/components/finance/BudgetBar";
import { ExpenseItem } from "@/components/finance/ExpenseItem";
import { AddIncomeSheet } from "@/components/finance/AddIncomeSheet";
import { TransactionFilterSheet, type TxnFilter } from "@/components/finance/TransactionFilterSheet";
import { SpendingSummary } from "@/components/dashboard/SpendingSummary";
import { useBudgets, useDeleteExpense, useExpenses } from "@/hooks/useFinance";
import { CATEGORY_META, downloadCSV, formatINR, monthLabel, nowIST } from "@/lib/utils";
import type { ExpenseCategory } from "@/lib/supabase/types";

const CategoryDonut = dynamic(
  () => import("@/components/finance/CategoryDonut").then((m) => m.CategoryDonut),
  { ssr: false, loading: () => <Skeleton className="h-52 w-full rounded-card" /> }
);

type Tab = "overview" | "transactions" | "budget" | "reports";
const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "budget", label: "Budget" },
  { id: "reports", label: "Reports" },
];

export default function FinancePage() {
  const router = useRouter();
  const now = nowIST();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState<Tab>("overview");
  const [hideBalance, setHideBalance] = useState(false);
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [txnFilter, setTxnFilter] = useState<TxnFilter>({ type: "all", category: null });

  const expensesQuery = useExpenses(month, year);
  const budgetsQuery = useBudgets(month, year);
  const deleteExpense = useDeleteExpense();

  const allTransactions = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data]);
  const expenses = useMemo(
    () => allTransactions.filter((e) => e.transaction_type !== "income"),
    [allTransactions]
  );
  const income = useMemo(
    () => allTransactions.filter((e) => e.transaction_type === "income"),
    [allTransactions]
  );
  const budgets = budgetsQuery.data ?? [];

  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((e) => {
      if (txnFilter.type !== "all" && e.transaction_type !== txnFilter.type) return false;
      if (txnFilter.category && e.category !== txnFilter.category) return false;
      return true;
    });
  }, [allTransactions, txnFilter]);

  const spent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalIncome = income.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const balance = totalIncome - spent;

  const spentByCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>();
    for (const e of expenses) {
      const cat = (e.category as ExpenseCategory | null) ?? "others";
      map.set(cat, (map.get(cat) ?? 0) + Number(e.amount));
    }
    return map;
  }, [expenses]);

  const navigateMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; } else if (m > 12) { m = 1; y += 1; }
    setMonth(m); setYear(y);
  };

  const loading = expensesQuery.isLoading || budgetsQuery.isLoading;
  const hide = (v: string) => (hideBalance ? "₹ ••••" : v);
  const activeFilterCount = (txnFilter.type !== "all" ? 1 : 0) + (txnFilter.category ? 1 : 0);

  return (
    <div>
      <Header
        title="Finance"
        showBell
        mobileAction={
          <button
            onClick={() => setFilterOpen(true)}
            aria-label="Filter transactions"
            className="relative grid place-items-center h-11 w-11 rounded-btn bg-card border border-line text-ink-dim hover:text-ink transition-colors"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        }
      />

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

      {/* Month selector */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <button onClick={() => navigateMonth(-1)} aria-label="Previous month" className="p-2.5 rounded-btn bg-card border border-line text-ink-dim">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold w-40 text-center">{monthLabel(month, year)}</span>
        <button onClick={() => navigateMonth(1)} aria-label="Next month" className="p-2.5 rounded-btn bg-card border border-line text-ink-dim">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <CardSkeleton className="h-44" />
          <RowSkeleton rows={4} />
        </div>
      ) : (
        <>
          {/* Total Balance gradient card (all tabs) */}
          <div className="relative overflow-hidden rounded-hero p-5 mb-4 bg-pulse-gradient text-white">
            <div aria-hidden className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
            <button
              onClick={() => setHideBalance((v) => !v)}
              className="flex items-center gap-1.5 text-sm font-semibold opacity-90"
            >
              Total Balance {hideBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
            <motion.p
              key={`${month}-${year}-${balance}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-4xl font-black tracking-tight tabular-nums"
            >
              {hide(formatINR(balance))}
            </motion.p>
            <div className="mt-4 flex gap-5 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-white/20"><ArrowDownLeft className="h-3.5 w-3.5" /></span>
                <span><span className="opacity-75 text-xs">Income</span> <b>{hide(formatINR(totalIncome))}</b></span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="grid place-items-center h-6 w-6 rounded-full bg-white/20"><ArrowUpRight className="h-3.5 w-3.5" /></span>
                <span><span className="opacity-75 text-xs">Expenses</span> <b>{hide(formatINR(spent))}</b></span>
              </span>
            </div>
          </div>

          {tab === "overview" && (
            <>
              <BorrowLendCard />
              {allTransactions.length === 0 && budgets.length === 0 ? (
                <EmptyState
                  illustration="expenses"
                  title="No transactions this month"
                  description="Log manually, paste a UPI SMS, or scan a payment screenshot."
                  actionLabel="Add first expense"
                  onAction={() => router.push("/finance/add")}
                />
              ) : (
                <>
                  {expenses.length > 0 && (
                    <Card className="p-4 mb-4">
                      <h2 className="text-lg font-semibold mb-2">Monthly Spending</h2>
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

                  {allTransactions.length > 0 && (
                    <Card className="mb-4">
                      <div className="flex items-center justify-between px-4 pt-4">
                        <h2 className="text-lg font-semibold">Recent Transactions</h2>
                        <button onClick={() => setTab("transactions")} className="text-xs font-semibold text-primary">View All</button>
                      </div>
                      <div className="divide-y divide-line/60 mt-1">
                        <AnimatePresence initial={false}>
                          {allTransactions.slice(0, 5).map((expense, i) => (
                            <ExpenseItem key={expense.id} expense={expense} index={i} onDelete={(id) => deleteExpense.mutate(id)} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

          {tab === "transactions" && (
            filteredTransactions.length === 0 ? (
              <EmptyState
                illustration="expenses"
                title="No transactions"
                description={activeFilterCount > 0 ? "No transactions match this filter." : "Everything you log this month shows up here."}
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
            )
          )}

          {tab === "budget" && (
            <>
              {budgets.length === 0 ? (
                <EmptyState illustration="expenses" title="No budgets set" description="Set per-category monthly limits — Pulse warns you at 80%." actionLabel="Set budgets" onAction={() => router.push("/finance/budget")} />
              ) : (
                <Card className="p-4 space-y-4">
                  {budgets.filter((b) => Number(b.amount) > 0).map((b) => (
                    <BudgetBar
                      key={b.id}
                      category={b.category as ExpenseCategory}
                      spent={spentByCategory.get(b.category as ExpenseCategory) ?? 0}
                      limit={Number(b.amount)}
                    />
                  ))}
                </Card>
              )}
              <Link href="/finance/budget" className="block mt-4">
                <Button variant="secondary" className="w-full">Edit budgets</Button>
              </Link>
            </>
          )}

          {tab === "reports" && (
            <>
              <SpendingSummary expenses={allTransactions} budgets={budgets} />
              <Button
                variant="secondary"
                className="w-full"
                onClick={() =>
                  downloadCSV(`pulse-transactions-${year}-${String(month).padStart(2, "0")}.csv`,
                    allTransactions.map((e) => ({
                      date: e.date, type: e.transaction_type, amount: e.amount, category: e.category ?? "others",
                      merchant: e.merchant ?? "", source: e.source ?? "manual",
                    })))
                }
              >
                <Download className="h-4 w-4" /> Export {monthLabel(month, year)} (CSV)
              </Button>
            </>
          )}

          {/* Quick Add bar (above bottom nav) */}
          <div className="fixed bottom-[76px] inset-x-0 z-30 md:static md:mt-4 px-4 pb-2 pointer-events-none">
            <div className="pointer-events-auto max-w-3xl mx-auto flex items-center gap-2 bg-card/95 backdrop-blur border border-line rounded-full px-3 py-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-ink-dim shrink-0">Quick Add:</span>
              {[
                { label: "Add Expense", color: "#FF5C5C", icon: ArrowUpRight, href: "/finance/add" },
                { label: "Add Income", color: "#43D98C", icon: ArrowDownLeft, onClick: () => setAddIncomeOpen(true) },
                { label: "Set Budget", color: "#43D98C", icon: Wallet, href: "/finance/budget" },
                { label: "Scan Bill", color: "#4FACFE", icon: ScanLine, href: "/finance/add?tab=screenshot" },
                { label: "Split Bill", color: "#FFB347", icon: Users, href: "/finance/borrow" },
              ].map((a) =>
                a.href ? (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: `${a.color}22`, color: a.color }}
                  >
                    <a.icon className="h-3.5 w-3.5" /> {a.label}
                  </Link>
                ) : (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: `${a.color}22`, color: a.color }}
                  >
                    <a.icon className="h-3.5 w-3.5" /> {a.label}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="h-14 md:hidden" />
        </>
      )}

      <AddIncomeSheet open={addIncomeOpen} onClose={() => setAddIncomeOpen(false)} />
      <TransactionFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filter={txnFilter}
        onChange={setTxnFilter}
      />

      <FAB label="Add expense" onClick={() => router.push("/finance/add")} />
    </div>
  );
}
