"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, House, Map, User, Wallet } from "lucide-react";
import { isNavActive } from "./Sidebar";
import { cn } from "@/lib/utils";

/**
 * Bottom nav v2 — built from scratch.
 * Flat bar (no borders, no shadows), theme-black background, 64px tall,
 * safe-area padding. Active tab shows icon + label with a primary glow dot;
 * inactive tabs are icon-only muted. Center Map FAB floats above the bar.
 * Blurs slightly while the page is scrolling.
 */

const LEFT = [
  { href: "/dashboard", label: "Home", icon: House, match: ["/dashboard"] },
  {
    href: "/academic",
    label: "Academic",
    icon: BookOpen,
    match: ["/academic", "/attendance", "/timetable"],
  },
] as const;

const RIGHT = [
  { href: "/finance", label: "Finance", icon: Wallet, match: ["/finance"] },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    match: ["/profile", "/settings", "/friends", "/polls", "/leaderboard"],
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
  const [flash, setFlash] = useState(false);

  return (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 180);
      }}
      className="relative flex-1 h-16 grid place-items-center select-none"
    >
      <motion.span
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="relative flex flex-col items-center gap-0.5"
      >
        <Icon
          className={cn(
            "h-[22px] w-[22px] transition-colors duration-150",
            active ? "text-primary" : flash ? "text-primary/70" : "text-[#555570]"
          )}
          strokeWidth={2}
        />
        {active && (
          <>
            <span className="text-[10px] font-bold text-ink leading-none">{label}</span>
            {/* Glow under active icon */}
            <motion.span
              layoutId="nav-glow"
              className="absolute -bottom-2 h-1 w-6 rounded-full bg-primary"
              style={{ boxShadow: "0 0 12px 3px #6C63FF88" }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            />
          </>
        )}
      </motion.span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [scrolling, setScrolling] = useState(false);
  const mapActive = isNavActive(pathname, ["/map"]);

  // Backdrop blur while scrolling
  useEffect(() => {
    let timer: number;
    const onScroll = () => {
      setScrolling(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setScrolling(false), 260);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <nav
      aria-label="Main"
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe transition-[backdrop-filter,background-color] duration-200",
        scrolling ? "bg-bg/75 backdrop-blur-xl" : "bg-bg"
      )}
    >
      <div className="relative flex items-stretch h-16">
        {LEFT.map((item) => (
          <NavTab
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isNavActive(pathname, item.match)}
          />
        ))}

        {/* Center Map FAB — elevated above the bar */}
        <div className="relative flex-1 grid place-items-center">
          <Link href="/map" aria-label="Campus map" aria-current={mapActive ? "page" : undefined}>
            <motion.span
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className="absolute left-1/2 -translate-x-1/2 -top-6 grid place-items-center h-14 w-14 rounded-full bg-primary text-white"
              style={{
                boxShadow: mapActive
                  ? "0 6px 24px -4px #6C63FFCC, 0 0 0 4px rgb(var(--bg))"
                  : "0 6px 20px -6px #6C63FF99, 0 0 0 4px rgb(var(--bg))",
              }}
            >
              <Map className="h-6 w-6" strokeWidth={2} />
            </motion.span>
          </Link>
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
  );
}
