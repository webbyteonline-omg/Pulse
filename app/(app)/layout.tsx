import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { PageTransition } from "@/components/layout/PageTransition";
import { PushPrompt } from "@/components/layout/PushPrompt";
import { AppShellExtras } from "@/components/layout/AppShellExtras";
import { OfflineBanner } from "@/components/ui/OfflineBanner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh">
      <OfflineBanner />
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="mx-auto max-w-3xl px-4 md:px-8 pt-6 pt-safe pb-28 md:pb-12">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
      <PushPrompt />
      <AppShellExtras />
    </div>
  );
}
