"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, House, Plus, User, Users } from "lucide-react";
import { QuickAddSheet } from "./QuickAddSheet";
import { isNavActive } from "./Sidebar";
import { cn } from "@/lib/utils";

/**
 * Bottom nav v3 — exact design spec:
 * 4 tabs (Home / Academics / Friends / Profile), center purple + FAB elevated
 * above the bar. Active tab shows icon + label in purple; inactive is icon
 * only, muted. 72px tall + safe area, theme background, no border.
 */

const LEFT = [
  { href: "/dashboard", label: "Home", icon: House, match: ["/dashboard"] },
  {
    href: "/academic",
    label: "Academics",
    icon: BookOpen,
    match: ["/academic", "/attendance", "/timetable"],
  },
] as const;

const RIGHT = [
  {
    href: "/friends",
    label: "Friends",
    icon: Users,
    match: ["/friends", "/polls", "/leaderboard"],
  },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    match: ["/profile", "/settings", "/health"],
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
      className="relative flex-1 h-[72px] grid place-items-center select-none"
    >
      <motion.span
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="flex flex-col items-center gap-1"
      >
        <Icon
          className={cn(
            "h-[23px] w-[23px] transition-colors duration-150",
            active ? "text-primary" : "text-[#555570]"
          )}
          strokeWidth={active ? 2.4 : 2}
          fill={active ? "#6C63FF22" : "none"}
        />
        {active && (
          <motion.span
            layoutId="nav-label"
            className="text-[10px] font-bold text-primary leading-none"
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
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Main"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-bg pb-safe"
      >
        <div className="relative flex items-stretch h-[72px]">
          {LEFT.map((item) => (
            <NavTab
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isNavActive(pathname, item.match)}
            />
          ))}

          {/* Center + FAB, elevated 12px above nav */}
          <div className="relative w-[76px] grid place-items-center">
            <motion.button
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.1 }}
              onClick={() => setQuickAddOpen(true)}
              aria-label="Quick add"
              className="absolute left-1/2 -translate-x-1/2 -top-3 grid place-items-center h-14 w-14 rounded-full bg-pulse-gradient text-white"
              style={{ boxShadow: "0 8px 24px -6px #6C63FFBB, 0 0 0 5px rgb(var(--bg))" }}
            >
              <Plus className="h-7 w-7" strokeWidth={2.4} />
            </motion.button>
          </div>

          {RIGHT.map((item) => (
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
      <QuickAddSheet open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
