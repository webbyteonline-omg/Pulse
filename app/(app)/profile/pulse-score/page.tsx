"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ScoreGauge } from "@/components/pulse-score/ScoreGauge";
import { useLivePulseScore, usePulseHistory } from "@/hooks/useProfile";
import { SCORE_COMPONENTS, scoreColor } from "@/lib/pulseScore";

export default function PulseScorePage() {
  const router = useRouter();
  const { breakdown, loading } = useLivePulseScore();
  const historyQuery = usePulseHistory();

  const history = historyQuery.data ?? [];
  const weekAgo = history.length >= 8 ? history[history.length - 8] : history[0];
  const delta =
    breakdown && weekAgo ? breakdown.total - weekAgo.score : null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push("/profile")}
          aria-label="Back"
          className="p-2 -ml-2 min-h-[44px] min-w-[44px] rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Pulse Score</h1>
      </div>

      {loading || !breakdown ? (
        <div className="space-y-4">
          <Skeleton className="h-52 w-full rounded-card" />
          <Skeleton className="h-40 w-full rounded-card" />
        </div>
      ) : (
        <>
          <Card gradient className="p-6 mb-4 flex flex-col items-center">
            <ScoreGauge breakdown={breakdown} compact />
            {delta !== null && delta !== 0 && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`mt-3 flex items-center gap-1 text-sm font-bold ${
                  delta > 0 ? "text-success" : "text-danger"
                }`}
              >
                {delta > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {delta > 0 ? `+${delta}` : delta} points this week
              </motion.p>
            )}
          </Card>

          {/* Breakdown */}
          <Card className="p-5 mb-4">
            <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-4">
              Breakdown
            </h2>
            <div className="space-y-4">
              {SCORE_COMPONENTS.map((component, i) => {
                const value = breakdown[component.key];
                const pct = (value / component.max) * 100;
                return (
                  <div key={component.key}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium">
                        {component.emoji} {component.label}
                      </span>
                      <span className="font-bold tabular-nums">
                        {value}
                        <span className="text-ink-faint font-medium">/{component.max}</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-line overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: pct >= 66 ? "#43D98C" : pct >= 33 ? "#FFB347" : "#FF5C5C" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-[11px] text-ink-faint">
              Attendance ≥80% earns full points · stay under budget · open Pulse daily for
              your streak · log your mood each day.
            </p>
          </Card>

          {/* 30-day history */}
          <Card className="p-4">
            <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-2 px-1">
              Last 30 days
            </h2>
            {history.length < 2 ? (
              <p className="text-sm text-ink-dim px-1 py-6 text-center">
                Your score history builds up day by day — check back tomorrow.
              </p>
            ) : (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6C63FF" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#6C63FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#8888A0", fontSize: 9 }}
                      tickFormatter={(d: string) => d.slice(8)}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis domain={[0, 100]} tick={{ fill: "#8888A0", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#1A1A24",
                        border: "1px solid #2A2A3A",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(value: number | string) => [`${value}`, "Score"]}
                    />
                    <Area type="monotone" dataKey="score" stroke="#6C63FF" strokeWidth={2.5} fill="url(#scoreFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <p className="mt-4 text-center text-[11px]" style={{ color: scoreColor(breakdown.total) }}>
            {breakdown.total >= 70
              ? "You're crushing it 🔥"
              : breakdown.total >= 40
                ? "Solid — a few daily check-ins will push you green."
                : "Small habits, big score. Start with attendance."}
          </p>
        </>
      )}
    </div>
  );
}
