"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, Plus } from "lucide-react";
import { PulseLogo } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { FriendSearch } from "@/components/friends/FriendSearch";
import { useCreateSubject, useSubjects } from "@/hooks/useAttendance";
import { usePushNotifications } from "@/hooks/useNotifications";
import { useUpdateProfile } from "@/hooks/useProfile";
import { SUBJECT_COLORS } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";

const CalendarUpload = dynamic(
  () => import("@/components/academic/CalendarUpload").then((m) => m.CalendarUpload),
  { ssr: false, loading: () => <Skeleton className="h-24 w-full rounded-card" /> }
);

const SUGGESTIONS = ["Mathematics", "Physics", "Chemistry", "CS101", "English", "Electronics"];
const TOTAL_STEPS = 5;

function Dots({ step }: { step: number }) {
  return (
    <div className="flex justify-center gap-1.5 mb-6" aria-label={`Step ${step + 1} of ${TOTAL_STEPS}`}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <motion.span
          key={i}
          animate={{ width: i === step ? 20 : 6 }}
          className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-line"}`}
        />
      ))}
    </div>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const setOnboarded = useSettingsStore((s) => s.setOnboarded);
  const updateProfile = useUpdateProfile();
  const createSubject = useCreateSubject();
  const { data: subjects } = useSubjects();
  const push = usePushNotifications();

  const [subjectName, setSubjectName] = useState("");
  const [colorIndex, setColorIndex] = useState(0);

  const addSubject = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createSubject.mutateAsync({
      name: trimmed,
      color: SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length] ?? "#6C63FF",
      required_percentage: 75,
    });
    setColorIndex((i) => i + 1);
    setSubjectName("");
  };

  const finish = async () => {
    setFinishing(true);
    setOnboarded(true);
    try {
      await updateProfile.mutateAsync({ onboarded: true });
    } catch {
      // local flag still set — profile sync will catch up
    }
    const confetti = (await import("canvas-confetti")).default;
    void confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 }, colors: ["#6C63FF", "#FF6584", "#43D98C", "#FFB347"] });
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, 1400);
  };

  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));

  const steps: React.ReactNode[] = [
    // 1 — Welcome
    <div key="welcome" className="text-center">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 160 }}
        className="flex justify-center mb-6"
      >
        <PulseLogo size={72} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-2xl font-black tracking-tight"
      >
        Welcome to Pulse
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-ink-dim"
      >
        Your college life, one screen.
      </motion.p>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        <Button size="lg" className="w-full mt-8" onClick={next}>
          Let&apos;s go
        </Button>
      </motion.div>
    </div>,

    // 2 — Calendar upload
    <div key="calendar">
      <h2 className="text-xl font-bold text-center">Import your academic calendar</h2>
      <p className="mt-1.5 text-sm text-ink-dim text-center mb-5">
        Drop the PDF and Gemini extracts every exam, holiday and deadline — with reminders
        before each one.
      </p>
      <CalendarUpload />
      <Button size="lg" className="w-full" onClick={next}>
        Continue
      </Button>
      <button onClick={next} className="w-full min-h-[44px] mt-1 text-sm text-ink-dim hover:text-ink">
        Skip — I&apos;ll do this later in Academic
      </button>
    </div>,

    // 3 — Subjects
    <div key="subjects">
      <h2 className="text-xl font-bold text-center">Add your subjects</h2>
      <p className="mt-1.5 text-sm text-ink-dim text-center mb-5">
        Pulse tracks attendance per subject and tells you exactly how many classes you can bunk.
      </p>
      <div className="flex gap-2 mb-3">
        <Input
          placeholder="Subject name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void addSubject(subjectName);
            }
          }}
        />
        <Button
          onClick={() => void addSubject(subjectName)}
          loading={createSubject.isPending}
          disabled={!subjectName.trim()}
          aria-label="Add subject"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.filter(
          (s) => !(subjects ?? []).some((sub) => sub.name.toLowerCase() === s.toLowerCase())
        ).map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => void addSubject(suggestion)}
            className="px-3 py-2 rounded-full text-xs font-semibold border border-line text-ink-dim hover:border-primary hover:text-primary transition-colors"
          >
            + {suggestion}
          </button>
        ))}
      </div>
      {(subjects ?? []).length > 0 && (
        <div className="space-y-1.5 mb-4">
          {(subjects ?? []).map((subject) => (
            <div key={subject.id} className="flex items-center gap-2.5 rounded-input bg-card border border-line px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
              <span className="flex-1 text-sm font-medium">{subject.name}</span>
              <Check className="h-4 w-4 text-success" />
            </div>
          ))}
        </div>
      )}
      <Button size="lg" className="w-full" onClick={next}>
        {(subjects ?? []).length > 0 ? "Continue" : "Skip for now"}
      </Button>
    </div>,

    // 4 — First friend
    <div key="friends">
      <h2 className="text-xl font-bold text-center">Add your first friend</h2>
      <p className="mt-1.5 text-sm text-ink-dim text-center mb-5">
        Compare attendance, vote in polls, and race the weekly leaderboard together.
      </p>
      <FriendSearch />
      <Button size="lg" className="w-full mt-5" onClick={next}>
        Continue
      </Button>
      <button onClick={next} className="w-full min-h-[44px] mt-1 text-sm text-ink-dim hover:text-ink">
        Skip — I&apos;ll add friends later
      </button>
    </div>,

    // 5 — Notifications
    <div key="notifications" className="text-center">
      <div className="flex justify-center mb-5">
        <div className="h-16 w-16 rounded-card bg-primary-dim grid place-items-center">
          <BellRing className="h-8 w-8 text-primary" />
        </div>
      </div>
      <h2 className="text-xl font-bold">Never miss what matters</h2>
      <p className="mt-1.5 text-sm text-ink-dim mb-6">
        Exam reminders 3 days and 1 day before · low attendance warnings · budget alerts —
        all as push notifications.
      </p>
      <Button
        size="lg"
        className="w-full"
        loading={push.busy}
        onClick={async () => {
          await push.subscribe();
          void finish();
        }}
      >
        Enable notifications
      </Button>
      <button
        onClick={() => void finish()}
        disabled={finishing}
        className="w-full min-h-[44px] mt-1 text-sm text-ink-dim hover:text-ink"
      >
        Skip
      </button>
    </div>,
  ];

  return (
    <div className="min-h-dvh flex flex-col justify-center max-w-sm mx-auto px-5 py-10">
      {finishing ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-3xl mb-3">🎉</p>
          <h2 className="text-2xl font-black">You&apos;re all set!</h2>
          <p className="mt-2 text-ink-dim text-sm">Taking you to your dashboard…</p>
        </motion.div>
      ) : (
        <>
          <Dots step={step} />
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.1 }}
            >
              {steps[step]}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
