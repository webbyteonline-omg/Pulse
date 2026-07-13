"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Footprints } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSaveCheckin, useTodayCheckin } from "@/hooks/useProfile";

const MOODS = [
  { value: 1, emoji: "😞" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "🙂" },
  { value: 5, emoji: "😄" },
];

/**
 * Daily check-in: mood (1-5) + steps. Feeds the Pulse Score mood component,
 * Wrapped stats, and the steps leaderboard.
 */
export function CheckinCard() {
  const checkinQuery = useTodayCheckin();
  const saveCheckin = useSaveCheckin();
  const [mood, setMood] = useState<number | null>(null);
  const [steps, setSteps] = useState("");
  const [saved, setSaved] = useState(false);

  const existing = checkinQuery.data;

  useEffect(() => {
    if (existing) {
      setMood(existing.mood);
      setSteps(existing.steps !== null ? String(existing.steps) : "");
    }
  }, [existing]);

  if (checkinQuery.isLoading) return null;

  const done = !!existing && existing.mood !== null && !saved;

  const submit = async () => {
    await saveCheckin.mutateAsync({
      mood,
      steps: steps.trim() === "" ? null : Math.max(0, Math.floor(Number(steps)) || 0),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">
          Daily check-in
        </h2>
        {(done || saved) && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-success">
            <Check className="h-3.5 w-3.5" /> Logged
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 mb-3">
        {MOODS.map((m) => (
          <motion.button
            key={m.value}
            whileTap={{ scale: 0.8 }}
            onClick={() => setMood(m.value)}
            aria-label={`Mood ${m.value} of 5`}
            aria-pressed={mood === m.value}
            className={`h-11 w-11 grid place-items-center rounded-btn text-2xl transition-all ${
              mood === m.value
                ? "bg-primary-dim ring-2 ring-primary scale-110"
                : "opacity-50 hover:opacity-100"
            }`}
          >
            {m.emoji}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Footprints className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-faint" />
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="Steps today (from your phone)"
            aria-label="Steps today"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="w-full h-11 pl-9 pr-3 rounded-input clay-inset text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button
          onClick={submit}
          loading={saveCheckin.isPending}
          disabled={mood === null && steps.trim() === ""}
        >
          Save
        </Button>
      </div>
    </Card>
  );
}
