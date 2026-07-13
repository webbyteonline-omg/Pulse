"use client";

import { motion } from "framer-motion";

export function DockInLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <defs>
        <linearGradient id="dockin-logo-grad" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#8B6BFF" />
          <stop offset="1" stopColor="#6C4FE8" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#dockin-logo-grad)" />
      <path
        d="M15 14h8.5c6 0 10 4 10 10s-4 10-10 10H15V14z"
        fill="none"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19.5" cy="24" r="2.6" fill="white" />
    </svg>
  );
}

/** @deprecated Use DockInLogo. Kept as alias so existing imports keep working. */
export const PulseLogo = DockInLogo;

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="clay rounded-card p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
    >
      <div className="flex flex-col items-center text-center mb-7">
        <PulseLogo />
        <h1 className="mt-4 text-xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-ink-dim">{subtitle}</p>
      </div>
      {children}
    </motion.div>
  );
}
