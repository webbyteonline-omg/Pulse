"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { RealtimeProvider } from "@/lib/realtime";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { attendanceKeys } from "@/hooks/useAttendance";
import { academicKeys } from "@/hooks/useAcademic";
import { financeKeys } from "@/hooks/useFinance";
import { nowIST } from "@/lib/utils";

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

/**
 * Warms the React Query cache for the dashboard's core queries as soon as a
 * user session resolves (fresh login or session restore on app boot), so by
 * the time navigation lands on /dashboard the data is already there —
 * no spinner, no waterfall.
 */
function DashboardPrefetcher() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const primed = useRef<string | null>(null);

  useEffect(() => {
    if (!user || primed.current === user.id) return;
    primed.current = user.id;

    const supabase = getSupabaseBrowser();
    const now = nowIST();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const mm = String(month).padStart(2, "0");
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const monthStart = `${year}-${mm}-01`;
    const monthEnd = `${year}-${mm}-${String(lastDay).padStart(2, "0")}`;

    void Promise.all([
      queryClient.prefetchQuery({
        queryKey: attendanceKeys.subjects,
        queryFn: async () => {
          const { data, error } = await supabase
            .from("subjects")
            .select(
              "id,user_id,name,color,total_classes,attended_classes,required_percentage,created_at"
            )
            .order("created_at", { ascending: true });
          if (error) throw error;
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: academicKeys.events,
        queryFn: async () => {
          const { data, error } = await supabase
            .from("academic_events")
            .select(
              "id,user_id,title,event_type,date,description,subject_id,notified_3day,notified_1day,created_at"
            )
            .order("date", { ascending: true });
          if (error) throw error;
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: financeKeys.expenses(month, year),
        queryFn: async () => {
          const { data, error } = await supabase
            .from("expenses")
            .select("id,user_id,amount,merchant,category,note,date,source,transaction_type,created_at")
            .gte("date", monthStart)
            .lte("date", monthEnd)
            .order("date", { ascending: false })
            .order("created_at", { ascending: false });
          if (error) throw error;
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: financeKeys.budgets(month, year),
        queryFn: async () => {
          const { data, error } = await supabase
            .from("budgets")
            .select("id,user_id,month,year,category,amount")
            .eq("month", month)
            .eq("year", year);
          if (error) throw error;
          return data;
        },
      }),
      queryClient.prefetchQuery({
        queryKey: ["timetable"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("timetable_slots")
            .select("id,user_id,day_of_week,start_time,end_time,subject_id,room,created_at")
            .order("day_of_week")
            .order("start_time");
          if (error) throw error;
          return data;
        },
      }),
    ]);
  }, [user, queryClient]);

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
            // Data mutations are already reflected instantly via cache updates /
            // invalidation, and the realtime subscriptions (see RealtimeProvider)
            // push live changes for social data. A longer staleTime means most
            // screens render from cache instantly instead of waiting on a
            // network round-trip on every navigation.
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceWorkerRegistrar />
      <AuthListener />
      <DashboardPrefetcher />
      <ThemeSync />
      <RealtimeProvider>{children}</RealtimeProvider>
    </QueryClientProvider>
  );
}
