"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS, isNavActive } from "./Sidebar";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Explicitly warm the router cache for every tab on mount — Link's
  // viewport-based prefetch already covers on-screen links, but since all
  // 5 tabs are visible immediately here, this just guarantees the payload
  // is fetched right away instead of waiting on an intersection callback.
  useEffect(() => {
    for (const { href } of NAV_ITEMS) router.prefetch(href);
  }, [router]);

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/90 backdrop-blur-lg border-t border-line pb-safe"
    >
      <div className="grid grid-cols-5">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = isNavActive(pathname, match);
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-1 py-2.5 min-h-[52px] select-none"
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-active"
                  className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <motion.span whileTap={{ scale: 0.85 }}>
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-colors",
                    active ? "text-primary" : "text-ink-dim"
                  )}
                />
              </motion.span>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  active ? "text-ink" : "text-ink-dim"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
