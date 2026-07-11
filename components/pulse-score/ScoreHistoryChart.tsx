"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PulseScoreRow } from "@/lib/supabase/types";

/**
 * 30-day Pulse Score trend line. Split into its own file so Recharts (a
 * large dependency) can be dynamically imported by the pulse-score page
 * instead of shipping in the main bundle.
 */
export default function ScoreHistoryChart({ history }: { history: PulseScoreRow[] }) {
  return (
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
  );
}
