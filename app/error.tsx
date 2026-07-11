"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-4 p-8 text-center">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
        <circle cx="44" cy="44" r="42" stroke="#2A2A3A" strokeWidth="2" />
        <path d="M30 34l8 8-8 8M50 34l8 8-8 8" stroke="#FF5C5C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M32 62c8-6 16-6 24 0" stroke="#8888A0" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h1 className="text-xl font-bold">Something broke</h1>
      <p className="text-sm text-ink-dim max-w-xs">
        {error.message || "An unexpected error occurred."} Your data is safe — try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
