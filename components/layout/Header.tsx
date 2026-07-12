"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useFriendRequests } from "@/hooks/useFriends";
import { useMyProfile } from "@/hooks/useProfile";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/components/friends/OnlineIndicator";

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
 * Mobile rules: title + at most one mobileAction + bell + avatar on the
 * right. All other actions are hidden on mobile — pages provide a FAB /
 * bottom sheet instead. The avatar is shown on every page by default so
 * Profile is always one tap away now that it's no longer a bottom-nav tab.
 */
export function Header({ title, subtitle, action, mobileAction, showBell, showAvatar = true }: HeaderProps) {
  const { data: requests } = useFriendRequests();
  const pendingCount = (requests ?? []).filter((r) => r.direction === "incoming").length;
  const displayName = useAuthStore((s) => s.displayName)();
  const profileQuery = useMyProfile();

  return (
    <header className="flex items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-dim truncate">{subtitle}</p>}
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
            <motion.span whileTap={{ scale: 0.9 }} className="block">
              <Avatar
                name={displayName}
                size={36}
                showOnline
                userId={profileQuery.data?.id}
                src={profileQuery.data?.avatar_url}
              />
            </motion.span>
          </Link>
        )}
      </div>
    </header>
  );
}
