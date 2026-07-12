import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { PushPrompt } from "@/components/layout/PushPrompt";
import { AppShellExtras } from "@/components/layout/AppShellExtras";
import { RoutePrefetcher } from "@/components/layout/RoutePrefetcher";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

// Auth is already enforced by middleware.ts (supabase.auth.getUser() there
// redirects unauthenticated requests to /login before this layout ever
// runs), and re-derived client-side by AuthListener/useAuthStore. Doing a
// second server-side getUser() here was a pure redundant network round-trip
// on every single navigation — removed for latency, not just cleanliness.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <RoutePrefetcher />
      <OfflineBanner />
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-3xl px-4 md:px-8 pt-safe pb-28 md:pb-12">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
      <PushPrompt />
      <AppShellExtras />
    </div>
  );
}
