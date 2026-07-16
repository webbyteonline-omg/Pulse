"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SubTab {
  href: string;
  label: string;
}

/** Horizontal section tabs (currently just Friends: Friends/Polls/Leaderboard). */
export function SubTabs({ tabs, layoutId }: { tabs: SubTab[]; layoutId: string }) {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 clay rounded-btn p-1 mb-5">
      {tabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative flex-1 grid place-items-center h-10 rounded-input text-xs font-bold transition-colors",
              active ? "text-white" : "text-ink-dim hover:text-ink"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-input bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export const SOCIAL_TABS: SubTab[] = [
  { href: "/friends", label: "Friends" },
  { href: "/groups", label: "Groups" },
];
