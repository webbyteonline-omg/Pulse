"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera, House, Users, Users2, UserRound } from "lucide-react";
import { isNavActive } from "./Sidebar";
import { cn } from "@/lib/utils";
import { SnapCameraSheet } from "@/components/snaps/SnapCameraSheet";

/**
 * Social-first bottom nav — 4 route tabs around a centre camera FAB:
 *   Home | Friends | [Snap] | Groups | Me
 * Academics / Finance / Map / Health now live under the "Me" tab, so their
 * paths map to Me for active-state purposes.
 */

const TABS = [
  { href: "/dashboard", label: "Home", icon: House, match: ["/dashboard"] },
  {
    href: "/friends",
    label: "Friends",
    icon: Users,
    match: ["/friends", "/chats", "/snaps"],
  },
  { href: "/groups", label: "Groups", icon: Users2, match: ["/groups"] },
  {
    href: "/profile",
    label: "Me",
    icon: UserRound,
    match: ["/profile", "/settings", "/academic", "/attendance", "/map", "/privacy"],
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
  const router = useRouter();
  const warm = () => router.prefetch(href);
  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={warm}
      onTouchStart={warm}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="relative flex-1 grid h-16 place-items-center select-none touch-manipulation"
    >
      <motion.span
        initial={false}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="relative flex flex-col items-center gap-1"
      >
        {active && (
          <motion.span
            layoutId="nav-glow"
            className="genz-gradient absolute -inset-2.5 rounded-full opacity-20 blur-[2px]"
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
          />
        )}
        <Icon
          className={cn(
            "relative h-[23px] w-[23px] transition-colors duration-150",
            active ? "text-secondary" : "text-ink-dim"
          )}
          strokeWidth={active ? 2.4 : 2}
        />
        {active && (
          <motion.span
            layoutId="nav-label"
            className="relative text-[10px] font-bold text-secondary leading-none"
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
  const [snapOpen, setSnapOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openSnap = useCallback(() => setSnapOpen(true), []);
  const closeSnap = useCallback(() => setSnapOpen(false), []);

  // Hide the whole bar inside a full-screen chat thread.
  if (/^\/chats\/[^/]+/.test(pathname)) return null;

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
          <NavTab {...TABS[0]} active={isNavActive(pathname, TABS[0].match)} />
          <NavTab {...TABS[1]} active={isNavActive(pathname, TABS[1].match)} />

          {/* Center camera FAB */}
          <div className="relative grid w-[68px] shrink-0 place-items-center">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={openSnap}
              aria-label="New snap"
              className="genz-gradient-btn absolute -top-6 flex size-16 items-center justify-center rounded-full ring-4 ring-bg"
            >
              <Camera className="size-7" strokeWidth={2.2} />
            </motion.button>
          </div>

          <NavTab {...TABS[2]} active={isNavActive(pathname, TABS[2].match)} />
          <NavTab {...TABS[3]} active={isNavActive(pathname, TABS[3].match)} />
        </div>
      </nav>

      <SnapCameraSheet open={snapOpen} onClose={closeSnap} />
    </>
  );
}
