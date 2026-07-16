"use client";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { RealtimeProvider } from "@/lib/realtime";
import { SplashScreen } from "@/components/SplashScreen";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { attendanceKeys } from "@/hooks/useAttendance";
import { academicKeys } from "@/hooks/useAcademic";
import { PROFILE_COLUMNS } from "@/lib/supabase/columns";

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
 * Warms the React Query cache for the app's core queries as soon as a user
 * session resolves (fresh login or session restore on app boot), so by the
 * time navigation lands on Dashboard, Friends, or Profile the data is
 * already there — no spinner, no waterfall. Previously this only warmed
 * Dashboard's queries, which meant Friends/Profile always paid full fetch
 * latency on first visit every session — this is the fix for that gap.
 */
function DashboardPrefetcher() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const primed = useRef<string | null>(null);

  useEffect(() => {
    if (!user || primed.current === user.id) return;
    primed.current = user.id;

    const supabase = getSupabaseBrowser();

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
      // Profile: single small row, keyed identically to useMyProfile.
      queryClient.prefetchQuery({
        queryKey: ["profile"],
        queryFn: async () => {
          const { data, error } = await supabase
            .from("user_profiles")
            .select(PROFILE_COLUMNS)
            .eq("id", user.id)
            .maybeSingle();
          if (error) throw error;
          return data;
        },
      }),
      // Friends list — keyed identically to useFriends so the Friends tab
      // reads straight from cache on first visit instead of refetching.
      queryClient.prefetchQuery({
        queryKey: ["friends"],
        queryFn: async () => {
          const { data: rows, error } = await supabase
            .from("friendships")
            .select("friend_id")
            .eq("user_id", user.id);
          if (error) throw error;
          const ids = rows.map((r) => r.friend_id);
          if (ids.length === 0) return [];
          const { data: profiles, error: e2 } = await supabase
            .from("user_profiles")
            .select(PROFILE_COLUMNS)
            .in("id", ids);
          if (e2) throw e2;
          return profiles;
        },
      }),
      // Friend requests — keyed identically to useFriendRequests, drives
      // the notification-bell badge too so warming it helps more than just
      // the Friends tab.
      queryClient.prefetchQuery({
        queryKey: ["friend-requests"],
        queryFn: async () => {
          const { data: requests, error } = await supabase
            .from("friend_requests")
            .select("id,sender_id,receiver_id,status,created_at")
            .eq("status", "pending")
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
          if (error) throw error;
          if (requests.length === 0) return [];
          const otherIds = requests.map((r) =>
            r.sender_id === user.id ? r.receiver_id : r.sender_id
          );
          const { data: profiles } = await supabase
            .from("user_profiles")
            .select(PROFILE_COLUMNS)
            .in("id", otherIds);
          const byId = new Map((profiles ?? []).map((p) => [p.id, p]));
          return requests.map((r) => ({
            ...r,
            direction: r.receiver_id === user.id ? ("incoming" as const) : ("outgoing" as const),
            profile: byId.get(r.sender_id === user.id ? r.receiver_id : r.sender_id) ?? null,
          }));
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

/** Once per browser session, not once per app-open — sessionStorage clears
 * on tab close, so returning users within the same tab session never see it
 * again, but a fresh visit always does. */
function useShowSplash(): [boolean, () => void] {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("pulse-splash-shown")) return false;
    sessionStorage.setItem("pulse-splash-shown", "1");
    return true;
  });
  return [show, () => setShow(false)];
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
  const [showSplash, dismissSplash] = useShowSplash();

  return (
    <QueryClientProvider client={queryClient}>
      <ServiceWorkerRegistrar />
      <AuthListener />
      <DashboardPrefetcher />
      <ThemeSync />
      <RealtimeProvider>{children}</RealtimeProvider>
      {/* Overlay, not a replacement — children mount and start resolving
       * auth/onboarding underneath immediately, so nothing is delayed by
       * the splash; it just visually covers the app for a beat. */}
      {showSplash && <SplashScreen onComplete={dismissSplash} />}
    </QueryClientProvider>
  );
}
