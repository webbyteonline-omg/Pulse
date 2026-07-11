"use client";

import { motion } from "framer-motion";
import { Button } from "./Button";

export interface EmptyStateProps {
  illustration: "subjects" | "events" | "expenses" | "generic";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function Illustration({ kind }: { kind: EmptyStateProps["illustration"] }) {
  const common = { width: 120, height: 96, viewBox: "0 0 120 96", fill: "none" } as const;
  switch (kind) {
    case "subjects":
      return (
        <svg {...common} aria-hidden>
          <rect x="26" y="18" width="52" height="64" rx="6" fill="#1A1A24" stroke="#2A2A3A" strokeWidth="2" />
          <rect x="38" y="12" width="52" height="64" rx="6" fill="#1A1A24" stroke="#6C63FF" strokeWidth="2" />
          <line x1="48" y1="30" x2="80" y2="30" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="42" x2="74" y2="42" stroke="#2A2A3A" strokeWidth="3" strokeLinecap="round" />
          <line x1="48" y1="54" x2="78" y2="54" stroke="#2A2A3A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="90" cy="70" r="14" fill="#6C63FF" opacity="0.15" />
          <path d="M90 64v12M84 70h12" stroke="#6C63FF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "events":
      return (
        <svg {...common} aria-hidden>
          <rect x="24" y="20" width="72" height="60" rx="8" fill="#1A1A24" stroke="#2A2A3A" strokeWidth="2" />
          <line x1="24" y1="36" x2="96" y2="36" stroke="#2A2A3A" strokeWidth="2" />
          <line x1="42" y1="14" x2="42" y2="26" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round" />
          <line x1="78" y1="14" x2="78" y2="26" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round" />
          <circle cx="44" cy="50" r="4" fill="#43D98C" />
          <circle cx="60" cy="50" r="4" fill="#FF5C5C" />
          <circle cx="76" cy="62" r="4" fill="#FFB347" />
          <circle cx="44" cy="62" r="4" fill="#2A2A3A" />
        </svg>
      );
    case "expenses":
      return (
        <svg {...common} aria-hidden>
          <rect x="28" y="26" width="64" height="44" rx="8" fill="#1A1A24" stroke="#2A2A3A" strokeWidth="2" />
          <rect x="34" y="20" width="64" height="44" rx="8" fill="#1A1A24" stroke="#6C63FF" strokeWidth="2" />
          <circle cx="66" cy="42" r="9" fill="#6C63FF" opacity="0.2" />
          <text x="66" y="47" textAnchor="middle" fill="#6C63FF" fontSize="13" fontWeight="700">₹</text>
          <path d="M30 82c8-8 18 4 26-2s16 2 24-4" stroke="#43D98C" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden>
          <circle cx="60" cy="48" r="30" fill="#1A1A24" stroke="#2A2A3A" strokeWidth="2" />
          <path d="M42 50c5-10 12-10 16-3s11 7 20-3" stroke="#6C63FF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
  }
}

/** Friendly empty state with illustration + CTA. */
export function EmptyState({ illustration, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-12 px-6"
    >
      <Illustration kind={illustration} />
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-1.5 text-sm text-ink-dim max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
