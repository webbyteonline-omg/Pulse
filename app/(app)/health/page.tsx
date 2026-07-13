"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Droplets, Flame, Footprints, Heart, Info, Moon, NotebookPen, Wind } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useSaveCheckin, useTodayCheckin } from "@/hooks/useProfile";
import { encryptJSON } from "@/lib/encryption";
import type { DailyCheckin } from "@/lib/supabase/types";

const GOALS = { steps: 8000, water: 2500, calories: 750, sleep: 480 };
const MOODS = [
  { value: 5, emoji: "😄", label: "Great" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 1, emoji: "😡", label: "Bad" },
];

function wellness(c: DailyCheckin | null | undefined): number {
  if (!c) return 0;
  const parts: number[] = [];
  if (c.steps !== null) parts.push(Math.min(1, c.steps / GOALS.steps));
  if (c.water_ml !== null) parts.push(Math.min(1, c.water_ml / GOALS.water));
  if (c.sleep_minutes !== null) parts.push(Math.min(1, c.sleep_minutes / GOALS.sleep));
  if (c.mood !== null) parts.push(c.mood / 5);
  if (parts.length === 0) return 0;
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 100);
}

export default function HealthPage() {
  const checkinQuery = useTodayCheckin();
  const save = useSaveCheckin();
  const checkin = checkinQuery.data;
  const score = wellness(checkin);

  const [logOpen, setLogOpen] = useState<null | "steps" | "water" | "calories" | "sleep">(null);
  const [logValue, setLogValue] = useState("");
  const [timer, setTimer] = useState<null | { label: string; seconds: number; color: string }>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState("");

  const glance = [
    { id: "steps" as const, icon: Footprints, color: "#43D98C", label: "Steps", value: checkin?.steps?.toLocaleString("en-IN") ?? "—", goal: checkin?.steps ? `${Math.min(100, Math.round((checkin.steps / GOALS.steps) * 100))}% Goal` : "Tap to log" },
    { id: "water" as const, icon: Droplets, color: "#4FACFE", label: "Water", value: checkin?.water_ml ? `${(checkin.water_ml / 1000).toFixed(1)} L` : "—", goal: checkin?.water_ml ? `${Math.min(100, Math.round((checkin.water_ml / GOALS.water) * 100))}% Goal` : "Tap to log" },
    { id: "calories" as const, icon: Flame, color: "#FFB347", label: "Calories", value: checkin?.calories?.toString() ?? "—", goal: checkin?.calories ? `${Math.min(100, Math.round((checkin.calories / GOALS.calories) * 100))}% Goal` : "Burned (tap)" },
    { id: "sleep" as const, icon: Moon, color: "#6C63FF", label: "Sleep", value: checkin?.sleep_minutes ? `${Math.floor(checkin.sleep_minutes / 60)}h ${checkin.sleep_minutes % 60}m` : "—", goal: checkin?.sleep_minutes ? (checkin.sleep_minutes >= 420 ? "Good" : "Short") : "Tap to log" },
  ];

  const actions = [
    { label: "Meditate", dur: "5 min", seconds: 300, color: "#6C63FF", icon: Heart },
    { label: "Breathing", dur: "3 min", seconds: 180, color: "#4FACFE", icon: Wind },
    { label: "Stretch", dur: "10 min", seconds: 600, color: "#43D98C", icon: Footprints },
  ];

  const goalsMet = [
    checkin?.steps && checkin.steps >= GOALS.steps,
    checkin?.water_ml && checkin.water_ml >= GOALS.water,
    checkin?.sleep_minutes && checkin.sleep_minutes >= 420,
    checkin?.mood && checkin.mood >= 4,
  ].filter(Boolean).length;

  const saveLog = async () => {
    if (!logOpen) return;
    const n = Number(logValue);
    if (!Number.isFinite(n) || n < 0) return;
    const patch: Partial<Pick<DailyCheckin, "steps" | "water_ml" | "calories" | "sleep_minutes">> =
      logOpen === "steps" ? { steps: Math.floor(n) }
      : logOpen === "water" ? { water_ml: Math.floor(n) }
      : logOpen === "calories" ? { calories: Math.floor(n) }
      : { sleep_minutes: Math.floor(n * 60) };
    await save.mutateAsync(patch);
    setLogOpen(null);
    setLogValue("");
  };

  return (
    <div>
      <Header title="Health" subtitle="Your well-being, our priority" />

      {checkinQuery.isLoading ? (
        <CardSkeleton className="h-36" />
      ) : (
        <>
          {/* Wellness score — gradient hero */}
          <div className="relative overflow-hidden rounded-hero p-5 mb-5 bg-pulse-gradient text-white">
            <p className="flex items-center gap-1.5 text-sm font-semibold opacity-90">
              Wellness Score <Info className="h-3.5 w-3.5" />
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-black tabular-nums mt-1">
                  {score}
                  <span className="text-lg font-bold opacity-70"> /100</span>
                </p>
                <p className="mt-1 text-xs font-bold">
                  ● {score >= 75 ? "Great" : score >= 50 ? "Good" : score > 0 ? "Building up" : "Log something below"}
                </p>
              </div>
              <div className="relative h-20 w-20 grid place-items-center">
                <svg width="80" height="80" className="-rotate-90 absolute">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="7" />
                  <motion.circle
                    cx="40" cy="40" r="34" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - score / 100) }}
                    transition={{ duration: 1 }}
                  />
                </svg>
                <span className="text-2xl">{score >= 75 ? "😄" : score >= 50 ? "🙂" : "😌"}</span>
              </div>
            </div>
          </div>

          {/* Today at a glance */}
          <h2 className="text-lg font-semibold mb-3">Today at a Glance</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {glance.map((g, i) => (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setLogOpen(g.id);
                  setLogValue("");
                }}
                className="clay rounded-card p-4 text-left"
              >
                <span className="grid place-items-center h-9 w-9 rounded-full mb-2" style={{ backgroundColor: `${g.color}22` }}>
                  <g.icon className="h-4.5 w-4.5" style={{ color: g.color, height: 18, width: 18 }} />
                </span>
                <p className="text-xl font-black tabular-nums">{g.value}</p>
                <p className="text-[11px] text-ink-dim">{g.label} · <span style={{ color: g.color }}>{g.goal}</span></p>
              </motion.button>
            ))}
          </div>

          {/* Mind & Mood */}
          <h2 className="text-lg font-semibold">Mind &amp; Mood</h2>
          <p className="text-xs text-ink-dim mb-3">How are you feeling today?</p>
          <div className="flex justify-between gap-1 mb-6">
            {MOODS.map((m) => {
              const active = checkin?.mood === m.value;
              return (
                <motion.button
                  key={m.value}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => save.mutate({ mood: m.value })}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-1 rounded-card px-2 py-2.5 min-w-[56px] border transition-colors ${
                    active ? "border-primary bg-primary-dim" : "border-line bg-card"
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className={`text-[10px] font-bold ${active ? "text-primary" : "text-ink-dim"}`}>{m.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Quick actions */}
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {actions.map((a) => (
              <motion.button
                key={a.label}
                whileTap={{ scale: 0.96 }}
                onClick={() => setTimer({ label: a.label, seconds: a.seconds, color: a.color })}
                className="clay rounded-card p-4 text-left"
              >
                <span className="grid place-items-center h-9 w-9 rounded-full mb-2" style={{ backgroundColor: `${a.color}22` }}>
                  <a.icon style={{ color: a.color, height: 18, width: 18 }} />
                </span>
                <p className="text-sm font-bold">{a.label}</p>
                <p className="text-[11px] text-ink-dim">{a.dur}</p>
              </motion.button>
            ))}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setJournalText("");
                setJournalOpen(true);
              }}
              className="clay rounded-card p-4 text-left"
            >
              <span className="grid place-items-center h-9 w-9 rounded-full mb-2 bg-warning-dim">
                <NotebookPen style={{ color: "#FFB347", height: 18, width: 18 }} />
              </span>
              <p className="text-sm font-bold">Journal</p>
              <p className="text-[11px] text-ink-dim">Today 🔒 encrypted</p>
            </motion.button>
          </div>

          {/* Insights */}
          <Card className="p-4 border-success/30 bg-success-dim/40">
            <p className="text-sm font-bold text-success">
              {goalsMet >= 3 ? "You're doing great!" : goalsMet >= 1 ? "Nice start!" : "Fresh day, fresh you"}
            </p>
            <p className="text-xs text-ink-dim mt-0.5">
              You&apos;ve met {goalsMet} of 4 goals today. {goalsMet >= 3 ? "Keep it up! 🔥" : "Small steps count 💪"}
            </p>
          </Card>
        </>
      )}

      {/* Log sheet */}
      <Modal open={logOpen !== null} onClose={() => setLogOpen(null)} title={`Log ${logOpen ?? ""}`}>
        <div className="space-y-4">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            autoFocus
            placeholder={logOpen === "water" ? "ml (e.g. 1600)" : logOpen === "sleep" ? "hours (e.g. 7.5)" : logOpen === "calories" ? "kcal burned" : "steps"}
            value={logValue}
            onChange={(e) => setLogValue(e.target.value)}
            className="w-full h-14 px-4 rounded-input clay-inset text-2xl font-black tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Button size="lg" className="w-full" onClick={saveLog} loading={save.isPending} disabled={!logValue.trim()}>
            Save
          </Button>
        </div>
      </Modal>

      {/* Journal sheet — E2E encrypted */}
      <Modal open={journalOpen} onClose={() => setJournalOpen(false)} title="Journal 🔒">
        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value)}
          placeholder="How was today, really?"
          className="w-full min-h-[140px] p-3.5 rounded-input clay-inset text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-[11px] text-ink-faint mt-2">Encrypted on your device — nobody else can read this.</p>
        <Button
          size="lg"
          className="w-full mt-3"
          loading={save.isPending}
          disabled={!journalText.trim()}
          onClick={async () => {
            const enc = `enc:${await encryptJSON(journalText.trim())}`;
            await save.mutateAsync({ journal: enc });
            setJournalOpen(false);
          }}
        >
          Save entry
        </Button>
      </Modal>

      {/* Timer overlay */}
      <AnimatePresence>
        {timer && <TimerOverlay {...timer} onDone={() => setTimer(null)} />}
      </AnimatePresence>
    </div>
  );
}

function TimerOverlay({ label, seconds, color, onDone }: { label: string; seconds: number; color: string; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur flex flex-col items-center justify-center gap-6"
    >
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="h-40 w-40 rounded-full grid place-items-center"
        style={{ backgroundColor: `${color}22`, border: `3px solid ${color}` }}
      >
        <p className="text-4xl font-black text-white tabular-nums">
          {mm}:{ss}
        </p>
      </motion.div>
      <p className="text-white font-bold">{label} — breathe in… breathe out…</p>
      <Button variant="secondary" onClick={onDone}>
        {left === 0 ? "Done ✨" : "End early"}
      </Button>
    </motion.div>
  );
}
