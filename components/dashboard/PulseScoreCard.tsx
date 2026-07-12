"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HelpCircle, TrendingUp, Zap } from "lucide-react";
import { usePulseHistory } from "@/hooks/useProfile";
import type { PulseBreakdown } from "@/lib/pulseScore";

function scoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Great";
  if (score >= 50) return "Good";
  if (score >= 30) return "Getting there";
  return "Needs love";
}

/** Mockup-style hero card: gradient ring gauge + weekly delta + sparkline. */
export function PulseScoreCard({ breakdown }: { breakdown: PulseBreakdown }) {
  const historyQuery = usePulseHistory();
  const history = historyQuery.data ?? [];
  const [display, setDisplay] = useState(0);
  const score = breakdown.total;

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setDisplay(Math.round(score * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const weekAgo = history.length >= 8 ? history[history.length - 8] : history[0];
  const delta = weekAgo ? score - weekAgo.score : null;

  // Sparkline from last 14 days
  const points = history.slice(-14).map((h) => h.score);
  const sparkline = (() => {
    if (points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = Math.max(1, max - min);
    const w = 96;
    const h = 36;
    return points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * w;
        const y = h - ((p - min) / range) * (h - 4) - 2;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  })();

  const size = 128;
  const stroke = 11;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <Link href="/profile/pulse-score" className="block mb-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.985 }}
        className="relative overflow-hidden rounded-card border border-primary/25 p-5"
        style={{
          background:
            "linear-gradient(135deg, rgb(var(--card)) 30%, #6C63FF22 75%, #9B4DFF2E 100%)",
        }}
      >
        <div
          aria-hidden
          className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-primary/25 blur-3xl"
        />
        <div className="relative flex items-center justify-between mb-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-dim">
            Pulse Score <HelpCircle className="h-3.5 w-3.5 text-ink-faint" />
          </p>
          {delta !== null && delta !== 0 && (
            <span
              className={`flex items-center gap-1 text-xs font-bold ${
                delta > 0 ? "text-success" : "text-danger"
              }`}
            >
              <TrendingUp className={`h-3.5 w-3.5 ${delta < 0 ? "rotate-180" : ""}`} />
              {delta > 0 ? `↑ ${delta}` : `↓ ${Math.abs(delta)}`} This Week
            </span>
          )}
        </div>

        <div className="relative flex items-center gap-5">
          {/* Ring gauge with gradient stroke */}
          <div className="relative grid place-items-center shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              <defs>
                <linearGradient id="pulse-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6C63FF" />
                  <stop offset="55%" stopColor="#9B4DFF" />
                  <stop offset="100%" stopColor="#5AB0FF" />
                </linearGradient>
              </defs>
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth={stroke} />
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke="url(#pulse-ring)"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                style={{ filter: "drop-shadow(0 0 8px #6C63FF66)" }}
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-4xl font-black tabular-nums leading-none">{display}</p>
              <p className="mt-1 flex items-center justify-center gap-0.5 text-[10px] font-bold text-primary">
                <Zap className="h-3 w-3" fill="#6C63FF" /> {scoreLabel(score)}
              </p>
            </div>
          </div>

          {/* Sparkline */}
          <div className="flex-1 min-w-0">
            {sparkline ? (
              <svg viewBox="0 0 96 36" className="w-full h-16" preserveAspectRatio="none" aria-hidden>
                <motion.path
                  d={sparkline}
                  fill="none"
                  stroke="#6C63FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                />
              </svg>
            ) : (
              <p className="text-xs text-ink-dim">
                Your score trend appears here after a few days of using Pulse.
              </p>
            )}
            <p className="text-[10px] text-ink-faint mt-1">Tap for full breakdown →</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
