export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // Full-bleed clay canvas — the login / signup pages are full-screen
  // mobile layouts (top back-arrow + hero illustration + form), so no
  // centered card wrapper here. Each page owns its own padding + safe area.
  return (
    <main className="clay-page min-h-dvh mx-auto w-full max-w-md">{children}</main>
  );
}
