"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Shirt } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSaveCheckin, useUpdateProfile } from "@/hooks/useProfile";

const AVATARS = [
  "/dockin/avatar-sachin.png",
  "/dockin/avatar-ananya.png",
  "/dockin/avatar-rohit.png",
  "/dockin/avatar-priya.png",
  "/dockin/avatar-karan.png",
  "/dockin/avatar-muskan.png",
  "/dockin/avatar-aditya.png",
  "/avatars/dev.png",
];

// Vibe moods → mapped onto the app-wide 1–5 wellbeing scale used by
// daily_checkins.mood (so the Health page + Pulse Score stay consistent).
const MOODS = [
  { emoji: "😄", label: "Happy", value: 5 },
  { emoji: "😎", label: "Chill", value: 4 },
  { emoji: "🤔", label: "Focused", value: 3 },
  { emoji: "🤩", label: "Excited", value: 5 },
  { emoji: "😴", label: "Tired", value: 2 },
];

const OUTFITS = [
  { color: "text-clay-purple" },
  { color: "text-clay-blue" },
  { color: "text-clay-orange" },
  { color: "text-clay-green" },
];

export default function AvatarSetupPage() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const saveCheckin = useSaveCheckin();

  const [avatar, setAvatar] = useState(0);
  const [mood, setMood] = useState(0);
  const [outfit, setOutfit] = useState(0);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ avatar_url: AVATARS[avatar] });
      saveCheckin.mutate({ mood: MOODS[mood]!.value });
      // Outfit is cosmetic — stash it on the auth user metadata, best-effort.
      void getSupabaseBrowser().auth.updateUser({ data: { avatar_outfit: outfit } });
    } catch {
      // Non-blocking — profile can be completed later in Settings.
    }
    router.replace("/onboarding");
    router.refresh();
  };

  return (
    <main className="clay-page min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-safe pt-safe">
        <h1 className="mt-6 text-center text-[24px] font-extrabold tracking-tight text-ink">
          Almost There! <span className="align-middle">🎉</span>
        </h1>
        <p className="mx-auto mt-1 max-w-[16rem] text-center text-sm leading-relaxed text-ink-dim">
          Let&apos;s create your DockIn avatar to get you started.
        </p>

        {/* 1 — Avatar */}
        <h2 className="mt-6 text-sm font-bold text-ink">1. Choose Your Avatar</h2>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {AVATARS.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setAvatar(i)}
              className={cn(
                "clay-soft relative aspect-square overflow-hidden rounded-2xl transition",
                avatar === i && "ring-2 ring-clay-purple"
              )}
            >
              <Image src={src} alt={`Avatar ${i + 1}`} fill className="object-cover" />
              {avatar === i && (
                <span className="clay-purple-btn absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 2 — Mood */}
        <h2 className="mt-6 text-sm font-bold text-ink">2. How are you feeling today?</h2>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {MOODS.map((m, i) => (
            <button
              key={m.label}
              type="button"
              onClick={() => setMood(i)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl py-2.5 transition",
                mood === i ? "clay-inset bg-clay-purple-dim" : "clay-soft"
              )}
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span className={cn("text-[11px] font-semibold", mood === i ? "text-clay-purple" : "text-ink-dim")}>
                {m.label}
              </span>
            </button>
          ))}
        </div>

        {/* 3 — Outfit */}
        <h2 className="mt-6 text-sm font-bold text-ink">3. Pick an Outfit</h2>
        <div className="mt-3 grid grid-cols-4 gap-2.5">
          {OUTFITS.map((o, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOutfit(i)}
              className={cn(
                "clay-soft relative flex aspect-square items-center justify-center rounded-2xl transition",
                outfit === i && "ring-2 ring-clay-purple"
              )}
            >
              <Shirt className={cn("size-9", o.color)} strokeWidth={1.8} />
              {outfit === i && (
                <span className="clay-purple-btn absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full">
                  <Check className="size-3" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={finish}
          disabled={saving}
          className="clay-purple-btn mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Let&apos;s Go! <span>🚀</span>
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </>
          )}
        </motion.button>
        <button
          type="button"
          onClick={() => router.replace("/onboarding")}
          className="mt-3 w-full pb-4 text-center text-xs text-ink-faint hover:text-ink-dim"
        >
          You can always change this later in settings.
        </button>
      </div>
    </main>
  );
}
