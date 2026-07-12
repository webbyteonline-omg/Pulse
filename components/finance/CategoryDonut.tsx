"use client";

import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CATEGORY_META, formatINR } from "@/lib/utils";
import type { Expense, ExpenseCategory } from "@/lib/supabase/types";

interface Slice {
  name: string;
  value: number;
  color: string;
  category: ExpenseCategory;
}

export function CategoryDonut({ expenses }: { expenses: Expense[] }) {
  const { slices, total } = useMemo(() => {
    const byCategory = new Map<ExpenseCategory, number>();
    for (const e of expenses) {
      if (e.transaction_type === "income") continue;
      const cat = (e.category as ExpenseCategory | null) ?? "others";
      byCategory.set(cat, (byCategory.get(cat) ?? 0) + Number(e.amount));
    }
    const slices: Slice[] = [...byCategory.entries()]
      .map(([category, value]) => ({
        category,
        name: CATEGORY_META[category].label,
        value,
        color: CATEGORY_META[category].color,
      }))
      .sort((a, b) => b.value - a.value);
    return { slices, total: slices.reduce((s, x) => s + x.value, 0) };
  }, [expenses]);

  if (slices.length === 0) return null;

  return (
    <div className="relative h-52">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius="68%"
            outerRadius="95%"
            paddingAngle={3}
            cornerRadius={6}
            strokeWidth={0}
          >
            {slices.map((slice) => (
              <Cell key={slice.category} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#1A1A24",
              border: "1px solid #2A2A3A",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value: number | string, name: string) => [
              formatINR(Number(value)),
              name,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="text-center">
          <p className="text-[11px] text-ink-dim">Total</p>
          <p className="text-lg font-bold tracking-tight">{formatINR(total)}</p>
        </div>
      </div>
    </div>
  );
}
