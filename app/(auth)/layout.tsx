export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-primary/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 right-0 h-60 w-60 rounded-full bg-accent/10 blur-[100px]"
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </main>
  );
}
