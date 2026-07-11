"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { formatINR, todayIST } from "@/lib/utils";
import type { Budget, Expense } from "@/lib/supabase/types";

interface DayBar {
  day: string;
  amount: number;
  isToday: boolean;
}

/** Last-7-days spending bar chart + month total vs budget. */
export function SpendingSummary({ expenses, budgets }: { expenses: Expense[]; budgets: Budget[] }) {
  const monthTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);

  const bars = useMemo<DayBar[]>(() => {
    const today = todayIST();
    const [ty, tm, td] = today.split("-").map(Number);
    const base = Date.UTC(ty ?? 2026, (tm ?? 1) - 1, td ?? 1);
    const days: DayBar[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(base - i * 86_400_000);
      const iso = d.toISOString().slice(0, 10);
      const label = new Intl.DateTimeFormat("en-IN", { weekday: "short", timeZone: "UTC" }).format(d);
      days.push({
        day: label,
        amount: expenses
          .filter((e) => e.date === iso)
          .reduce((sum, e) => sum + Number(e.amount), 0),
        isToday: i === 0,
      });
    }
    return days;
  }, [expenses]);

  const budgetPct = totalBudget > 0 ? Math.min(100, (monthTotal / totalBudget) * 100) : 0;

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">This month</h2>
        <Link href="/finance" className="text-xs font-semibold text-primary hover:underline">
          Finance
        </Link>
      </div>
      <Card className="p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-ink-dim">Spent</p>
            <p className="text-2xl font-bold tracking-tight">{formatINR(monthTotal)}</p>
          </div>
          {totalBudget > 0 && (
            <p className="text-xs text-ink-dim">
              of <span className="font-semibold text-ink">{formatINR(totalBudget)}</span> budget
            </p>
          )}
        </div>

        {totalBudget > 0 && (
          <div className="mt-3 h-1.5 rounded-full bg-line overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${budgetPct}%`,
                background:
                  budgetPct < 65 ? "#43D98C" : budgetPct < 90 ? "#FFB347" : "#FF5C5C",
              }}
            />
          </div>
        )}

        <div className="mt-4 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#8888A0", fontSize: 10 }}
              />
              <Tooltip
                cursor={{ fill: "#2A2A3A", opacity: 0.4 }}
                contentStyle={{
                  background: "#1A1A24",
                  border: "1px solid #2A2A3A",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#8888A0" }}
                formatter={(value: number | string) => [formatINR(Number(value)), "Spent"]}
              />
              <Bar dataKey="amount" radius={[6, 6, 2, 2]} maxBarSize={28}>
                {bars.map((bar, i) => (
                  <Cell key={i} fill={bar.isToday ? "#6C63FF" : "#2F2F42"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}
