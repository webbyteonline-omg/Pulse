"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export interface HeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  action?: React.ReactNode;
  showBell?: boolean;
}

export function Header({ title, subtitle, action, showBell }: HeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-dim">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {action}
        {showBell && (
          <Link href="/settings#notifications" aria-label="Notification settings">
            <motion.span
              whileTap={{ scale: 0.85 }}
              className="grid place-items-center h-10 w-10 rounded-btn bg-card border border-line text-ink-dim hover:text-ink transition-colors"
            >
              <Bell className="h-[18px] w-[18px]" />
            </motion.span>
          </Link>
        )}
      </div>
    </header>
  );
}
