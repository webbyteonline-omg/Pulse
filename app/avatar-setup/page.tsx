"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Camera, Check, Loader2 } from "lucide-react";
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

// Gradient swatches for the avatar ring color — cosmetic only, stashed on
// user metadata alongside avatar_outfit (no dedicated DB column exists).
const RING_GRADIENTS = [
  "linear-gradient(135deg,#7C3AED,#F43F5E)",
  "linear-gradient(135deg,#FB923C,#F43F5E)",
  "linear-gradient(135deg,#4F86F7,#7C3AED)",
  "linear-gradient(135deg,#2FBF87,#4F86F7)",
];

const BATCHES = ["CS - Batch 2027", "ECE - Batch 2027", "Mech - Batch 2026"];
const HOSTELS = ["Hostel A", "Hostel B", "Hostel C", "Hostel D"];

export default function AvatarSetupPage() {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const saveCheckin = useSaveCheckin();

  const [avatar, setAvatar] = useState(0);
  const [ring, setRing] = useState(0);
  const [batch, setBatch] = useState<number | null>(null);
  const [hostel, setHostel] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ avatar_url: AVATARS[avatar] });
      saveCheckin.mutate({ mood: 3 });
      // Cosmetic-only fields — stashed on auth user metadata, best-effort.
      void getSupabaseBrowser().auth.updateUser({
        data: {
          avatar_ring: ring,
          batch: batch !== null ? BATCHES[batch] : undefined,
          hostel: hostel !== null ? HOSTELS[hostel] : undefined,
        },
      });
    } catch {
      // Non-blocking — profile can be completed later in Settings.
    }
    router.replace("/onboarding");
    router.refresh();
  };

  return (
    <main className="min-h-dvh bg-bg">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-safe pt-safe">
        {/* Step progress */}
        <div className="mt-4 flex gap-1.5">
          <span className="genz-gradient h-1 flex-1 rounded-full" />
          <span className="genz-gradient h-1 flex-1 rounded-full" />
          <span className="h-1 flex-1 rounded-full bg-line" />
        </div>

        <h1 className="mt-6 text-[32px] font-extrabold leading-[1.05] tracking-tight text-ink">
          Show your face<span className="genz-gradient-text">.</span>
        </h1>
        <p className="mt-2 text-sm text-ink-dim">Friends recognize snaps, not usernames.</p>

        {/* Avatar upload circle */}
        <div className="relative mx-auto mt-7">
          <button
            type="button"
            className="relative grid size-32 place-items-center rounded-full border-[3px] border-dashed"
            style={{ borderImage: `${RING_GRADIENTS[ring]} 1` }}
          >
            <div className="genz-gradient grid size-28 place-items-center overflow-hidden rounded-full">
              <Image
                src={AVATARS[avatar]!}
                alt="Your avatar"
                width={112}
                height={112}
                className="size-full object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 grid size-9 place-items-center rounded-full bg-white shadow-lg">
              <Camera className="size-4 text-ink" />
            </span>
          </button>
          <span className="genz-gradient absolute -top-1 -right-3 rounded-full px-2.5 py-1 text-[10px] font-black text-white shadow-lg">
            lookin&apos; 👀
          </span>
        </div>

        {/* Avatar picker grid */}
        <div className="mt-5 grid grid-cols-4 gap-2.5">
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
                <span className="genz-gradient absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full">
                  <Check className="size-3 text-white" strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Ring color picker — gradient swatches */}
        <h2 className="mt-6 text-sm font-bold text-ink">Avatar ring color</h2>
        <div className="mt-3 flex gap-3">
          {RING_GRADIENTS.map((g, i) => (
            <button
              key={g}
              type="button"
              onClick={() => setRing(i)}
              className={cn(
                "size-10 rounded-full transition",
                ring === i && "ring-2 ring-offset-2 ring-offset-bg ring-ink"
              )}
              style={{ background: g }}
              aria-label={`Ring color ${i + 1}`}
            />
          ))}
        </div>

        {/* Batch + hostel chips */}
        <h2 className="mt-6 text-sm font-bold text-ink">Your batch</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {BATCHES.map((b, i) => (
            <button
              key={b}
              type="button"
              onClick={() => setBatch(i)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-bold transition",
                batch === i ? "genz-gradient border-transparent text-white" : "border-line text-ink-dim"
              )}
            >
              {b}
            </button>
          ))}
        </div>

        <h2 className="mt-4 text-sm font-bold text-ink">Your hostel</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {HOSTELS.map((h, i) => (
            <button
              key={h}
              type="button"
              onClick={() => setHostel(i)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-bold transition",
                hostel === i ? "genz-gradient border-transparent text-white" : "border-line text-ink-dim"
              )}
            >
              {h}
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={finish}
          disabled={saving}
          className="genz-gradient-btn mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold disabled:opacity-70"
        >
          {saving ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Continue <ArrowRight className="size-5" strokeWidth={2.5} />
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
