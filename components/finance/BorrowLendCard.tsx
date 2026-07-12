"use client";

import Link from "next/link";
import { ChevronRight, HandCoins } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { summarize, useBorrowLend } from "@/hooks/useBorrowLend";
import { formatINR } from "@/lib/utils";

/** Finance dashboard entry point for the borrow/lend tracker. */
export function BorrowLendCard() {
  const { data } = useBorrowLend();
  const summary = summarize(data ?? []);

  return (
    <Link href="/finance/borrow" className="block mb-4">
      <Card interactive className="p-4 flex items-center gap-3.5">
        <div className="h-11 w-11 rounded-btn bg-warning-dim grid place-items-center shrink-0">
          <HandCoins className="h-5 w-5 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">Borrow / Lend</p>
          <p className="text-xs text-ink-dim truncate">
            {summary.pendingCount === 0
              ? "All settled — track money with friends"
              : `${summary.pendingCount} pending ${summary.pendingCount === 1 ? "settlement" : "settlements"}`}
          </p>
        </div>
        {summary.net !== 0 && (
          <span
            className={`text-sm font-black tabular-nums shrink-0 ${
              summary.net > 0 ? "text-success" : "text-danger"
            }`}
          >
            {summary.net > 0 ? "+" : "−"}
            {formatINR(Math.abs(summary.net))}
          </span>
        )}
        <ChevronRight className="h-4 w-4 text-ink-faint shrink-0" />
      </Card>
    </Link>
  );
}
