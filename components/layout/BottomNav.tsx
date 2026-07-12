"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, House, Users, Wallet } from "lucide-react";
import { isNavActive } from "./Sidebar";
import { cn } from "@/lib/utils";

/**
 * Bottom nav v4 — exact design spec:
 * 4 tabs only (Home / Academics / Expense / Friends), NO center FAB. Profile
 * is reached via the avatar in the page header instead. Active tab shows
 * icon + label in primary purple with a soft glow; inactive is icon only,
 * muted (#555570). 64px tall + safe-area-inset-bottom padding. Pure flat
 * bar — no border, no shadow. Backdrop-blurs once the page has scrolled.
 */

const TABS = [
  { href: "/dashboard", label: "Home", icon: House, match: ["/dashboard"] },
  {
    href: "/attendance",
    label: "Academics",
    icon: BookOpen,
    match: ["/academic", "/attendance", "/timetable"],
  },
  { href: "/finance", label: "Expense", icon: Wallet, match: ["/finance"] },
  {
    href: "/friends",
    label: "Friends",
    icon: Users,
    match: ["/friends", "/polls", "/leaderboard"],
  },
] as const;

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
  return (
    <Link
      href={href}
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
            className="absolute -inset-2.5 rounded-full bg-primary/15 blur-[2px]"
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          />
        )}
        <Icon
          className={cn(
            "relative h-[23px] w-[23px] transition-colors duration-150",
            active ? "text-primary" : "text-[#555570]"
          )}
          strokeWidth={active ? 2.4 : 2}
        />
        {active && (
          <motion.span
            layoutId="nav-label"
            className="relative text-[10px] font-bold text-primary leading-none"
          >
            {label}
          </motion.span>
        )}
      </motion.span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Main"
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe transition-[backdrop-filter,background-color] duration-200",
        scrolled ? "bg-bg/80 backdrop-blur-lg" : "bg-bg"
      )}
    >
      <div className="flex items-stretch h-16">
        {TABS.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavActive(pathname, item.match)}
          />
        ))}
      </div>
    </nav>
  );
}
