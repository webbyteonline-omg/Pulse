"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  HeartPulse,
  House,
  LogOut,
  Map,
  User,
  Users,
  Wallet,
} from "lucide-react";
import { PulseLogo } from "@/components/auth/AuthCard";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: House, match: ["/dashboard"] },
  {
    href: "/attendance",
    label: "Academics",
    icon: BookOpen,
    match: ["/academic", "/attendance", "/timetable"],
  },
  { href: "/finance", label: "Finance", icon: Wallet, match: ["/finance"] },
  {
    href: "/friends",
    label: "Friends",
    icon: Users,
    match: ["/friends", "/polls", "/leaderboard"],
  },
  { href: "/map", label: "Campus Map", icon: Map, match: ["/map"] },
  { href: "/health", label: "Health", icon: HeartPulse, match: ["/health"] },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    match: ["/profile", "/settings"],
  },
] as const;

export function isNavActive(pathname: string, match: readonly string[]): boolean {
  return match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const displayName = useAuthStore((s) => s.displayName)();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    for (const { href } of NAV_ITEMS) router.prefetch(href);
  }, [router]);

  const logout = async () => {
    await getSupabaseBrowser().auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-line bg-card/50 min-h-dvh sticky top-0">
      <div className="flex items-center gap-3 px-5 py-6">
        <PulseLogo size={30} />
        <span className="text-lg font-bold tracking-tight">Pulse</span>
      </div>

      <nav className="flex-1 px-3 space-y-1" aria-label="Main">
        {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
          const active = isNavActive(pathname, match);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-medium transition-colors",
                active ? "text-ink" : "text-ink-dim hover:text-ink hover:bg-card"
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-btn bg-primary/15 border border-primary/25"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className={cn("h-[18px] w-[18px] relative", active && "text-primary")} />
              <span className="relative">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-line">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary grid place-items-center text-sm font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{displayName}</p>
            <p className="text-[11px] text-ink-dim truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            aria-label="Log out"
            className="p-2 rounded-input text-ink-dim hover:text-danger hover:bg-danger-dim transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
