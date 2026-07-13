"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useFriendRequests } from "@/hooks/useFriends";
import { useMyProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import { greeting, nowIST } from "@/lib/utils";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 10;

/** Shared hook: window-level scroll position, thresholded + rAF-throttled. */
function useIsScrolled(threshold = SCROLL_THRESHOLD) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY >= threshold);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

export interface PageHeaderProps {
  /** Page name (non-dashboard) or fallback title shown collapsed on dashboard. */
  title: string;
  /** Dashboard-only: swaps the expanded row for "Good morning, {name}" + date subtitle. */
  showGreeting?: boolean;
  /** Show the notification bell (with pending-request badge). */
  showBell?: boolean;
  /** Show a search icon button. */
  showSearch?: boolean;
  onBellClick?: () => void;
  onSearchClick?: () => void;
  /** Extra content rendered right after the title/greeting (e.g. a filter icon). */
  action?: React.ReactNode;
}

/**
 * Sticky, shrink-on-scroll page header. Anchored to the window scroll (the
 * app has no per-page scroll container — see app/(app)/layout.tsx), so it
 * works as a drop-in replacement for the old non-sticky Header everywhere.
 */
export function PageHeader({
  title,
  showGreeting = false,
  showBell = false,
  showSearch = false,
  onBellClick,
  onSearchClick,
  action,
}: PageHeaderProps) {
  const scrolled = useIsScrolled();
  const { data: requests } = useFriendRequests();
  const pendingCount = (requests ?? []).filter((r) => r.direction === "incoming").length;
  const displayName = useAuthStore((s) => s.displayName)();
  const profileQuery = useMyProfile();

  const dateLabel = showGreeting
    ? new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Asia/Kolkata",
      }).format(nowIST())
    : null;

  return (
    <motion.header
      className="sticky z-50 -mx-4 md:-mx-8 px-4 md:px-8 bg-bg"
      style={{
        top: "env(safe-area-inset-top, 0px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
      animate={{
        height: scrolled ? 52 : 64,
        paddingTop: scrolled ? 10 : 16,
        paddingBottom: scrolled ? 10 : 16,
      }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between gap-3 h-full">
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {showGreeting && !scrolled ? (
              <motion.div
                key="greeting"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <motion.h1
                  animate={{ fontSize: 20 }}
                  className="font-bold tracking-tight truncate text-ink"
                >
                  {greeting()}, {displayName} 👋
                </motion.h1>
                <p className="mt-0.5 text-[13px] text-ink-dim truncate">{dateLabel}</p>
              </motion.div>
            ) : (
              <motion.h1
                key="title"
                initial={{ opacity: 0, y: 4 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  fontSize: scrolled ? 17 : 20,
                }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className={cn("font-semibold truncate text-ink", scrolled ? "font-medium" : "font-semibold")}
              >
                {showGreeting ? "DockIn" : title}
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action}

          {showSearch && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onSearchClick}
              aria-label="Search"
              className="clay grid place-items-center h-10 w-10 rounded-btn text-ink-dim hover:text-ink transition-colors"
            >
              <Search className="h-[18px] w-[18px]" />
            </motion.button>
          )}

          {showBell && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onBellClick}
              aria-label="Notifications"
              className="clay relative grid place-items-center h-10 w-10 rounded-btn text-ink-dim hover:text-ink transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </motion.button>
          )}

          <Link href="/profile" aria-label="Profile">
            <motion.span
              whileTap={{ scale: 0.9 }}
              animate={{ width: scrolled ? 32 : 40, height: scrolled ? 32 : 40 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="block"
            >
              <Avatar
                name={displayName}
                size={scrolled ? 32 : 40}
                showOnline
                userId={profileQuery.data?.id}
                src={profileQuery.data?.avatar_url}
              />
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
