"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useFriendRequests } from "@/hooks/useFriends";
import { useMyProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD = 10;

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

export interface HeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  /** Desktop-only action cluster. On mobile, actions live in the FAB / bottom nav. */
  action?: React.ReactNode;
  /** Single icon button visible on BOTH mobile and desktop (e.g. a filter icon). */
  mobileAction?: React.ReactNode;
  /** Notification bell (single icon allowed on mobile alongside the avatar). */
  showBell?: boolean;
  /** Top-right profile avatar linking to /profile. On by default — pass false to hide. */
  showAvatar?: boolean;
}

/**
 * Sticky, shrink-on-scroll page header used by every non-dashboard page.
 * Anchored to the window scroll (the app shell has no per-page scroll
 * container — see app/(app)/layout.tsx). Mobile rules: title + at most one
 * mobileAction + bell + avatar on the right. All other actions are hidden
 * on mobile — pages provide a FAB / bottom sheet instead.
 */
export function Header({ title, subtitle, action, mobileAction, showBell, showAvatar = true }: HeaderProps) {
  const scrolled = useIsScrolled();
  const { data: requests } = useFriendRequests();
  const pendingCount = (requests ?? []).filter((r) => r.direction === "incoming").length;
  const displayName = useAuthStore((s) => s.displayName)();
  const profileQuery = useMyProfile();

  return (
    <motion.header
      className={cn(
        "sticky z-50 -mx-4 md:-mx-8 px-4 md:px-8 mb-4 transition-colors duration-200",
        scrolled ? "bg-[rgba(13,13,20,0.85)] backdrop-blur-xl" : "bg-bg"
      )}
      style={{ top: "env(safe-area-inset-top, 0px)" }}
      animate={{ paddingTop: scrolled ? 10 : 16, paddingBottom: scrolled ? 10 : 16 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <motion.h1
            animate={{ fontSize: scrolled ? 17 : 20 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={cn("truncate", scrolled ? "font-medium" : "font-bold tracking-tight md:text-2xl")}
          >
            {title}
          </motion.h1>
          {subtitle && !scrolled && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-0.5 text-sm text-ink-dim truncate"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action && <div className="hidden md:flex items-center gap-2">{action}</div>}
          {mobileAction}
          {showBell && (
            <Link href="/friends?tab=requests" aria-label="Notifications">
              <motion.span
                whileTap={{ scale: 0.85 }}
                className="relative grid place-items-center h-11 w-11 rounded-btn bg-card border border-line text-ink-dim hover:text-ink transition-colors"
              >
                <Bell className="h-[18px] w-[18px]" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-white text-[10px] font-bold grid place-items-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </motion.span>
            </Link>
          )}
          {showAvatar && (
            <Link href="/profile" aria-label="Profile" className="md:hidden">
              <motion.span
                whileTap={{ scale: 0.9 }}
                animate={{ width: scrolled ? 32 : 36, height: scrolled ? 32 : 36 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="block"
              >
                <Avatar
                  name={displayName}
                  size={scrolled ? 32 : 36}
                  showOnline
                  userId={profileQuery.data?.id}
                  src={profileQuery.data?.avatar_url}
                />
              </motion.span>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
