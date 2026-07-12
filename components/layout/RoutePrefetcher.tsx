"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Core tabs the bottom nav / sidebar always link to — warmed on app mount
 * so the first tap on any of them feels instant, per the perf spec. Sidebar
 * already does this for its full nav item list; this is a lightweight,
 * layout-level belt-and-suspenders pass scoped to just the 4 bottom-nav
 * destinations so it stays cheap even before Sidebar/BottomNav mount. */
const CORE_ROUTES = ["/dashboard", "/attendance", "/finance", "/friends"] as const;

export function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    for (const route of CORE_ROUTES) router.prefetch(route);
  }, [router]);

  return null;
}
