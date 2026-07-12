"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ALL_CATEGORIES, ALL_INCOME_SOURCES, CATEGORY_META, INCOME_SOURCE_META } from "@/lib/utils";
import type { TransactionCategory, TransactionType } from "@/lib/supabase/types";

export interface TxnFilter {
  type: TransactionType | "all";
  category: TransactionCategory | null;
}

const TYPE_OPTIONS: Array<{ id: TxnFilter["type"]; label: string }> = [
  { id: "all", label: "All" },
  { id: "expense", label: "Expenses" },
  { id: "income", label: "Income" },
];

/** Bottom sheet: filter the Finance page's transaction list by type + category. */
export function TransactionFilterSheet({
  open,
  onClose,
  filter,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  filter: TxnFilter;
  onChange: (filter: TxnFilter) => void;
}) {
  const categoryOptions =
    filter.type === "income"
      ? ALL_INCOME_SOURCES.map((c) => ({ id: c, ...INCOME_SOURCE_META[c] }))
      : filter.type === "expense"
        ? ALL_CATEGORIES.map((c) => ({ id: c, ...CATEGORY_META[c] }))
        : [
            ...ALL_CATEGORIES.map((c) => ({ id: c, ...CATEGORY_META[c] })),
            ...ALL_INCOME_SOURCES.map((c) => ({ id: c, ...INCOME_SOURCE_META[c] })),
          ];

  return (
    <Modal open={open} onClose={onClose} title="Filter transactions">
      <div className="space-y-5">
        <div>
          <p className="text-xs font-medium text-ink-dim mb-2">Type</p>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onChange({ type: opt.id, category: null })}
                className={`flex-1 h-10 rounded-input text-xs font-bold transition-colors ${
                  filter.type === opt.id
                    ? "bg-primary text-white"
                    : "bg-input border border-line text-ink-dim"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-ink-dim mb-2">Category</p>
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            <button
              onClick={() => onChange({ ...filter, category: null })}
              className={`flex flex-col items-center gap-1 rounded-btn border py-2.5 transition-colors ${
                filter.category === null
                  ? "bg-primary-dim border-primary text-primary"
                  : "bg-input border-line text-ink-dim"
              }`}
            >
              <span className="text-lg" aria-hidden>
                ✨
              </span>
              <span className="text-[10px] font-bold">Any</span>
            </button>
            {categoryOptions.map((c) => (
              <button
                key={c.id}
                onClick={() => onChange({ ...filter, category: c.id as TransactionCategory })}
                className="flex flex-col items-center gap-1 rounded-btn border py-2.5 transition-colors"
                style={{
                  backgroundColor: filter.category === c.id ? `${c.color}1f` : "rgb(var(--input))",
                  borderColor: filter.category === c.id ? c.color : "rgb(var(--line))",
                }}
              >
                <span className="text-lg" aria-hidden>
                  {c.emoji}
                </span>
                <span
                  className="text-[10px] font-bold text-center leading-tight"
                  style={{ color: filter.category === c.id ? c.color : "rgb(var(--ink-dim))" }}
                >
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => {
              onChange({ type: "all", category: null });
              onClose();
            }}
          >
            Reset
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
}
