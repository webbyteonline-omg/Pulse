"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarDays, Users, Wallet } from "lucide-react";
import { DockInLogo } from "@/components/auth/AuthCard";

type Slide = {
  image: string;
  alt: string;
  title: string;
  subtitle: string;
  features: { icon: typeof Users; label: string; tint: string; bg: string }[];
};

const SLIDES: Slide[] = [
  {
    image: "/dockin/group-onboarding.png",
    alt: "A group of cheerful DockIn students",
    title: "Welcome to DockIn!",
    subtitle: "The social hub for Bennettians. Connect. Share. Collaborate.",
    features: [
      { icon: Users, label: "Connect with classmates & friends", tint: "text-clay-purple", bg: "bg-clay-purple-dim" },
      { icon: CalendarDays, label: "Stay updated with events & groups", tint: "text-clay-pink", bg: "bg-clay-pink-dim" },
      { icon: Wallet, label: "Manage academics, finance & more", tint: "text-clay-orange", bg: "bg-clay-orange-dim" },
    ],
  },
  {
    image: "/dockin/campus-sunset.png",
    alt: "Bennett University campus at sunset",
    title: "Your campus, live",
    subtitle: "See where your friends are, who's free, and what's happening around you — in real time.",
    features: [
      { icon: Users, label: "Friends Live — see who's around", tint: "text-clay-green", bg: "bg-clay-green-dim" },
      { icon: CalendarDays, label: "Groups, polls & campus events", tint: "text-clay-blue", bg: "bg-clay-blue-dim" },
      { icon: Wallet, label: "Snaps & chats with your squad", tint: "text-clay-pink", bg: "bg-clay-pink-dim" },
    ],
  },
  {
    image: "/dockin/wallet-3d.png",
    alt: "Academics and finance illustration",
    title: "All sorted, one screen",
    subtitle: "Attendance, deadlines, budget and your Pulse Score — everything a Bennettian needs, together.",
    features: [
      { icon: CalendarDays, label: "Attendance & bunk calculator", tint: "text-clay-purple", bg: "bg-clay-purple-dim" },
      { icon: Wallet, label: "Track spends & split with friends", tint: "text-clay-orange", bg: "bg-clay-orange-dim" },
      { icon: Users, label: "Climb the weekly leaderboard", tint: "text-clay-yellow", bg: "bg-clay-yellow-dim" },
    ],
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [i, setI] = useState(0);
  const slide = SLIDES[i]!;
  const last = i === SLIDES.length - 1;

  const next = () => {
    if (last) router.push("/signup");
    else setI((v) => v + 1);
  };

  return (
    <main className="clay-page min-h-dvh flex flex-col">
      {/* Hero image */}
      <div className="relative px-6 pt-safe">
        <Link
          href="/signup"
          className="absolute right-7 top-[calc(env(safe-area-inset-top,0px)+18px)] z-10 text-sm font-semibold text-clay-purple"
        >
          Skip
        </Link>
        <div className="relative mx-auto h-60 w-full max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.image}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority
                quality={90}
                sizes="(max-width: 400px) 100vw, 384px"
                className="object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Card */}
      <div className="clay relative -mt-2 flex-1 rounded-t-clay-lg px-6 pb-safe pt-9">
        {/* Logo badge */}
        <div className="clay-purple-btn absolute -top-8 left-1/2 flex size-16 -translate-x-1/2 items-center justify-center rounded-clay">
          <DockInLogo size={34} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22 }}
          >
            <h1 className="text-center text-[26px] font-extrabold tracking-tight text-ink">{slide.title}</h1>
            <p className="mx-auto mt-2 max-w-[17rem] text-center text-sm leading-relaxed text-ink-dim">
              {slide.subtitle}
            </p>

            <div className="mt-6 space-y-3">
              {slide.features.map((f) => (
                <div key={f.label} className="clay-soft flex items-center gap-3 rounded-clay px-4 py-3.5">
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${f.bg}`}>
                    <f.icon className={`size-5 ${f.tint}`} strokeWidth={2.2} />
                  </span>
                  <span className="text-sm font-medium text-ink">{f.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={next}
          className="clay-purple-btn mt-6 flex w-full items-center justify-center gap-2 rounded-clay py-4 text-base font-bold"
        >
          {last ? "Get Started" : "Next"}
          <ArrowRight className="size-5" strokeWidth={2.5} />
        </motion.button>

        {/* Dots */}
        <div className="mt-5 flex items-center justify-center gap-2">
          {SLIDES.map((_, d) => (
            <button
              key={d}
              onClick={() => setI(d)}
              aria-label={`Go to slide ${d + 1}`}
              className="p-1.5"
            >
              <motion.span
                animate={{ width: d === i ? 22 : 8, opacity: d === i ? 1 : 0.4 }}
                className="block h-2 rounded-full bg-clay-purple"
              />
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-sm text-ink-dim">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-clay-purple hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
