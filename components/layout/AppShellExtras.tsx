"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useStatsSync, useMyProfile } from "@/hooks/useProfile";
import { useTodayClasses } from "@/hooks/useTimetable";
import { useSubjects } from "@/hooks/useAttendance";
import { nowIST, todayIST } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";

/** While the app is open: nudge "Mark attendance for X?" when a class ends. */
function useClassEndNudges() {
  const { data: classes } = useTodayClasses();
  const { data: subjects } = useSubjects();

  useEffect(() => {
    if (!classes || classes.length === 0) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    const subjectById = new Map((subjects ?? []).map((s) => [s.id, s]));
    const now = nowIST();
    const nowMs = now.getHours() * 3_600_000 + now.getMinutes() * 60_000;
    const timers: number[] = [];

    for (const slot of classes) {
      const [eh, em] = slot.end_time.split(":").map(Number);
      const endMs = (eh ?? 0) * 3_600_000 + (em ?? 0) * 60_000;
      const delay = endMs - nowMs;
      if (delay <= 0 || delay > 12 * 3_600_000) continue;
      const nudgeKey = `pulse-nudge-${slot.id}-${todayIST()}`;
      if (localStorage.getItem(nudgeKey)) continue;
      timers.push(
        window.setTimeout(() => {
          localStorage.setItem(nudgeKey, "1");
          const subject = subjectById.get(slot.subject_id);
          void navigator.serviceWorker?.ready.then((reg) =>
            reg.showNotification(`Mark attendance for ${subject?.name ?? "your class"}?`, {
              body: "Class just ended — one tap keeps your streak honest.",
              icon: "/icons/icon-192.png",
              tag: nudgeKey,
              data: { url: subject ? `/attendance/${subject.id}` : "/attendance" },
            })
          );
        }, delay)
      );
    }
    return () => timers.forEach((t) => clearTimeout(t));
  }, [classes, subjects]);
}

/**
 * Invisible glue mounted inside the app shell:
 * - daily-open streak + user_stats sync
 * - encrypted location tracking (when enabled)
 * - first-login redirect to /onboarding
 */
export function AppShellExtras() {
  useStatsSync();
  useLocationTracking();
  useClassEndNudges();

  const router = useRouter();
  const pathname = usePathname();
  const onboardedLocal = useSettingsStore((s) => s.onboarded);
  const profileQuery = useMyProfile();

  useEffect(() => {
    if (pathname.startsWith("/onboarding")) return;
    if (onboardedLocal) return;
    if (profileQuery.isLoading) return;
    const profile = profileQuery.data;
    if (profile && !profile.onboarded) {
      router.replace("/onboarding");
    }
  }, [pathname, onboardedLocal, profileQuery.isLoading, profileQuery.data, router]);

  return null;
}
