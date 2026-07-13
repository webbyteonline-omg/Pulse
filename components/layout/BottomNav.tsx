"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, House, MapPin, Users, Wallet } from "lucide-react";
import { isNavActive } from "./Sidebar";
import { cn } from "@/lib/utils";
import { MenuIcon } from "@/components/ui/MenuIcon";
import { MoreMenuSheet } from "./MoreMenuSheet";

/**
 * Bottom nav v6 — 5 route tabs (Home / Academics / Map / Expense / Friends)
 * plus a 6th "More" tab that opens a bottom-sheet menu instead of navigating
 * (Groups / Campus Map / Health / Profile / Settings / Privacy / About).
 * Profile is also reachable via the avatar in the page header.
 * Active tab shows icon + label in primary purple with a soft glow;
 * inactive is icon only, muted (#555570). 64px tall + safe-area-inset-bottom
 * padding. Pure flat bar — no border, no shadow. Backdrop-blurs once the
 * page has scrolled.
 */

const TABS = [
  { href: "/dashboard", label: "Home", icon: House, match: ["/dashboard"] },
  {
    href: "/attendance",
    label: "Academics",
    icon: BookOpen,
    match: ["/academic", "/attendance", "/timetable"],
  },
  { href: "/map", label: "Map", icon: MapPin, match: ["/map"] },
  { href: "/finance", label: "Expense", icon: Wallet, match: ["/finance"] },
  {
    href: "/friends",
    label: "Friends",
    icon: Users,
    match: ["/friends", "/polls", "/leaderboard"],
  },
] as const;

const MORE_MATCH = ["/groups", "/health", "/profile", "/settings", "/privacy", "/snaps", "/chats"];

function NavTab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof House;
  active: boolean;
}) {
  const router = useRouter();
  // Belt-and-suspenders prefetching: Link's own prefetch (viewport-based,
  // already on since these tabs are always mounted) plus an explicit
  // imperative prefetch on hover/touch-start so the route's JS + first
  // data fetch are warm before the tap even completes.
  const warm = () => router.prefetch(href);
  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={warm}
      onTouchStart={warm}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="relative flex-1 h-16 grid place-items-center select-none touch-manipulation"
    >
      <motion.span
        initial={false}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="relative flex flex-col items-center gap-1"
      >
        {active && (
          <motion.span
            layoutId="nav-glow"
            className="absolute -inset-2.5 rounded-full bg-clay-purple/20 blur-[2px]"
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          />
        )}
        <Icon
          className={cn(
            "relative h-[23px] w-[23px] transition-colors duration-150",
            active ? "text-clay-purple" : "text-ink-dim"
          )}
          strokeWidth={active ? 2.4 : 2}
        />
        {active && (
          <motion.span
            layoutId="nav-label"
            className="relative text-[10px] font-bold text-clay-purple leading-none"
          >
            {label}
          </motion.span>
        )}
      </motion.span>
    </Link>
  );
}

function MoreTab({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="More"
      aria-current={active ? "page" : undefined}
      className="relative flex-1 h-16 grid place-items-center select-none touch-manipulation"
    >
      <motion.span
        initial={false}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="relative flex flex-col items-center gap-1"
      >
        {active && (
          <motion.span
            layoutId="nav-glow"
            className="absolute -inset-2.5 rounded-full bg-clay-purple/20 blur-[2px]"
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          />
        )}
        <MenuIcon
          size={23}
          className={cn(
            "relative transition-colors duration-150",
            active ? "text-clay-purple" : "text-ink-dim"
          )}
        />
        {active && (
          <motion.span
            layoutId="nav-label"
            className="relative text-[10px] font-bold text-clay-purple leading-none"
          >
            More
          </motion.span>
        )}
      </motion.span>
    </button>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Stable references — BottomNav re-renders on every scroll tick (via
  // `scrolled`), and scrolling INSIDE the open menu sheet bubbles to that
  // same window scroll listener. An inline `() => setMoreOpen(...)` here
  // would get a new identity on each of those re-renders, which fed into
  // Modal's `useEffect([open, onClose])` and caused it to re-fire mid-open
  // — repeatedly pushing a history entry and then immediately calling
  // `history.back()` in the cleanup, which is what made every tap inside
  // the sheet unresponsive (the page was churning through history entries
  // under it). useCallback keeps these identities stable across re-renders.
  const openMore = useCallback(() => setMoreOpen(true), []);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  return (
    <>
      <nav
        aria-label="Main"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 pointer-events-none px-4 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+10px)]"
      >
        <div
          className={cn(
            "clay pointer-events-auto mx-auto flex h-16 max-w-md items-stretch rounded-clay px-1.5",
            scrolled && "backdrop-blur-lg"
          )}
        >
          {TABS.map((item) => (
            <NavTab
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isNavActive(pathname, item.match)}
            />
          ))}
          <MoreTab active={isNavActive(pathname, MORE_MATCH)} onClick={openMore} />
        </div>
      </nav>

      <MoreMenuSheet open={moreOpen} onClose={closeMore} />
    </>
  );
}
