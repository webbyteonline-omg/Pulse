"use client";

import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <svg width="72" height="72" viewBox="0 0 88 88" fill="none" aria-hidden>
        <circle cx="44" cy="44" r="42" stroke="#2A2A3A" strokeWidth="2" />
        <path d="M44 26v22" stroke="#FFB347" strokeWidth="4" strokeLinecap="round" />
        <circle cx="44" cy="60" r="3" fill="#FFB347" />
      </svg>
      <h2 className="text-lg font-bold">This page hit a snag</h2>
      <p className="text-sm text-ink-dim max-w-xs">
        {error.message || "Something went wrong loading this screen."}
      </p>
      <Button onClick={reset} variant="secondary">
        Reload section
      </Button>
    </div>
  );
}
