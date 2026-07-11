"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { nowIST } from "@/lib/utils";

// All three wrapped screens pull in html2canvas (via WrappedShell) for the
// share-as-image flow — keep them out of the main profile bundle.
const DailyWrapped = dynamic(
  () => import("@/components/wrapped/DailyWrapped").then((m) => m.DailyWrapped),
  { ssr: false }
);
const WeeklyWrapped = dynamic(
  () => import("@/components/wrapped/WeeklyWrapped").then((m) => m.WeeklyWrapped),
  { ssr: false }
);
const SemesterWrapped = dynamic(
  () => import("@/components/wrapped/SemesterWrapped").then((m) => m.SemesterWrapped),
  { ssr: false }
);

type WrappedType = "daily" | "weekly" | "semester";

export default function WrappedPage() {
  const router = useRouter();
  const [open, setOpen] = useState<WrappedType | null>(null);

  const hour = nowIST().getHours();
  const isSunday = nowIST().getDay() === 0;
  const dailyUnlocked = hour >= 20;

  const cards: Array<{
    type: WrappedType;
    title: string;
    desc: string;
    gradient: string;
    locked: boolean;
    lockNote?: string;
  }> = [
    {
      type: "daily",
      title: "Daily Wrapped",
      desc: "Today's steps, spends, classes & mood",
      gradient: "linear-gradient(135deg, #2E2A72, #6C63FF)",
      locked: !dailyUnlocked,
      lockNote: "Unlocks at 8 PM",
    },
    {
      type: "weekly",
      title: "Weekly Wrapped",
      desc: "Your week vs last week — every Sunday",
      gradient: "linear-gradient(135deg, #7A1F3D, #FF6584)",
      locked: false,
      lockNote: isSunday ? undefined : "Freshest on Sundays",
    },
    {
      type: "semester",
      title: "Semester Wrapped",
      desc: "The full story — bunks, money & the score journey",
      gradient: "linear-gradient(135deg, #7A5C00, #FFD700)",
      locked: false,
    },
  ];

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
        <h1 className="text-lg font-bold">Wrapped</h1>
      </div>

      <div className="space-y-4">
        {cards.map((card, i) => (
          <motion.button
            key={card.type}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={!card.locked ? { scale: 0.97 } : undefined}
            disabled={card.locked}
            onClick={() => setOpen(card.type)}
            className="w-full text-left"
          >
            <Card
              className="relative overflow-hidden p-6 border-0 min-h-[110px]"
              style={{ background: card.gradient }}
            >
              <div className="relative z-10 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <h2 className="text-lg font-black tracking-tight">{card.title}</h2>
                </div>
                <p className="mt-1 text-sm opacity-90">{card.desc}</p>
                {card.locked ? (
                  <p className="mt-2 flex items-center gap-1 text-xs font-bold opacity-90">
                    <Lock className="h-3 w-3" /> {card.lockNote}
                  </p>
                ) : card.lockNote ? (
                  <p className="mt-2 text-xs font-bold opacity-75">{card.lockNote}</p>
                ) : null}
              </div>
              {card.locked && <div className="absolute inset-0 bg-black/45 z-20" />}
              <div
                aria-hidden
                className="absolute -right-6 -bottom-10 h-32 w-32 rounded-full bg-white/15 blur-xl"
              />
            </Card>
          </motion.button>
        ))}
      </div>

      <p className="mt-5 text-center text-[11px] text-ink-faint">
        Share straight to Instagram or WhatsApp — or download as PNG.
      </p>

      {open === "daily" && <DailyWrapped onClose={() => setOpen(null)} />}
      {open === "weekly" && <WeeklyWrapped onClose={() => setOpen(null)} />}
      {open === "semester" && <SemesterWrapped onClose={() => setOpen(null)} />}
    </div>
  );
}
