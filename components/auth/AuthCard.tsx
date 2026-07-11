"use client";

import { motion } from "framer-motion";

export function PulseLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect width="48" height="48" rx="14" fill="#6C63FF" />
      <path
        d="M9 26h7l3.5-9 6 15 4-10.5 2 4.5H39"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

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
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-card border border-line rounded-card p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]"
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
