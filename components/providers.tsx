"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { RealtimeProvider } from "@/lib/realtime";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch(() => undefined);

    // Ask the SW to replay any queued offline mutations when we come back online
    const onOnline = () => {
      navigator.serviceWorker.ready.then((reg) => {
        if ("sync" in reg) {
          (reg as ServiceWorkerRegistration & {
            sync: { register: (tag: string) => Promise<void> };
          }).sync
            .register("pulse-outbox-sync")
            .catch(() => reg.active?.postMessage({ type: "REPLAY_OUTBOX" }));
        } else {
          reg.active?.postMessage({ type: "REPLAY_OUTBOX" });
        }
      });
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);
  return null;
}

function AuthListener() {
  const setUser = useAuthStore((s) => s.setUser);
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [setUser]);
  return null;
}

function ThemeSync() {
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light", "amoled");
    root.classList.add(theme);
  }, [theme]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 24 * 60 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceWorkerRegistrar />
      <AuthListener />
      <ThemeSync />
      <RealtimeProvider>{children}</RealtimeProvider>
    </QueryClientProvider>
  );
}
