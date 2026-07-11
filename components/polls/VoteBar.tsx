"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function VoteBar({
  label,
  count,
  total,
  isMyVote,
  isWinner,
  onVote,
  disabled,
}: {
  label: string;
  count: number;
  total: number;
  isMyVote: boolean;
  isWinner: boolean;
  onVote?: () => void;
  disabled: boolean;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const showResults = disabled || isMyVote;

  return (
    <motion.button
      whileTap={!disabled && onVote ? { scale: 0.98 } : undefined}
      onClick={onVote}
      disabled={disabled || !onVote}
      className={`relative w-full min-h-[44px] rounded-btn border overflow-hidden text-left px-3.5 py-2.5 transition-colors ${
        isMyVote
          ? "border-primary"
          : disabled
            ? "border-line"
            : "border-line hover:border-primary/50"
      }`}
      aria-pressed={isMyVote}
    >
      {showResults && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-y-0 left-0"
          style={{
            backgroundColor: isWinner ? "#6C63FF33" : "rgb(var(--line) / 0.35)",
          }}
        />
      )}
      <span className="relative flex items-center gap-2">
        <span className="flex-1 min-w-0 text-sm font-medium truncate">{label}</span>
        {isMyVote && <Check className="h-4 w-4 text-primary shrink-0" />}
        {showResults && (
          <span className="text-xs font-bold tabular-nums shrink-0">
            {pct}% <span className="text-ink-faint font-medium">({count})</span>
          </span>
        )}
      </span>
    </motion.button>
  );
}
