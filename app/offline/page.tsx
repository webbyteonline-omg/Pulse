export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-4 p-8 text-center">
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden>
        <circle cx="44" cy="44" r="42" stroke="#2A2A3A" strokeWidth="2" strokeDasharray="6 6" />
        <path
          d="M22 48c6-14 18-14 22-6s16 8 22-2"
          stroke="#6C63FF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
        <line x1="26" y1="62" x2="62" y2="26" stroke="#FF5C5C" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h1 className="text-xl font-bold">You&apos;re offline</h1>
      <p className="text-sm text-ink-dim max-w-xs">
        DockIn works offline for pages you&apos;ve already visited. Reconnect to sync new
        data — anything you add meanwhile will sync automatically.
      </p>
    </main>
  );
}
