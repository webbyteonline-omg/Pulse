"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { scoreColor, type PulseBreakdown } from "@/lib/pulseScore";

/** Animated circular Pulse Score gauge. Tap → full breakdown. */
export function ScoreGauge({
  breakdown,
  compact = false,
}: {
  breakdown: PulseBreakdown;
  compact?: boolean;
}) {
  const [display, setDisplay] = useState(0);
  const score = breakdown.total;
  const color = scoreColor(score);

  // Count-up animation
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 900;
    const step = (t: number) => {
      const progress = Math.min(1, (t - start) / duration);
      setDisplay(Math.round(score * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const size = compact ? 120 : 168;
  const stroke = compact ? 10 : 13;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  const gauge = (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--line))"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-black tabular-nums leading-none" style={{ color, fontSize: compact ? 30 : 42 }}>
          {display}
        </p>
        <p className="text-[10px] font-bold text-ink-dim uppercase tracking-widest mt-1">
          Pulse Score
        </p>
      </div>
    </div>
  );

  if (compact) return gauge;

  return (
    <Link href="/profile/pulse-score">
      <Card interactive gradient className="p-5 flex items-center justify-center">
        {gauge}
      </Card>
    </Link>
  );
}
