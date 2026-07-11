"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useSettingsStore, type Theme } from "@/store/settingsStore";

const THEMES: Array<{
  id: Theme;
  label: string;
  desc: string;
  bg: string;
  card: string;
  line: string;
  ink: string;
}> = [
  { id: "dark", label: "Dark", desc: "The Pulse default", bg: "#0F0F13", card: "#1A1A24", line: "#2A2A3A", ink: "#F0F0F5" },
  { id: "light", label: "Light", desc: "For bright rooms", bg: "#F5F5FA", card: "#FFFFFF", line: "#E0E0EC", ink: "#0F0F13" },
  { id: "amoled", label: "AMOLED", desc: "Pure black, saves battery", bg: "#000000", card: "#0A0A0A", line: "#1A1A1A", ink: "#FFFFFF" },
];

/** Theme picker with live preview cards. Switch is instant, no reload. */
export function ThemeSelector() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  return (
    <div className="grid grid-cols-3 gap-3">
      {THEMES.map((t) => {
        const active = theme === t.id;
        return (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(t.id)}
            aria-pressed={active}
            className="text-left rounded-card border-2 overflow-hidden transition-colors"
            style={{ borderColor: active ? "#6C63FF" : "rgb(var(--line))" }}
          >
            {/* Mini preview */}
            <div className="p-2.5" style={{ backgroundColor: t.bg }}>
              <div
                className="rounded-lg p-2 space-y-1.5 border"
                style={{ backgroundColor: t.card, borderColor: t.line }}
              >
                <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: t.ink, opacity: 0.85 }} />
                <div className="h-1.5 w-1/2 rounded-full" style={{ backgroundColor: t.ink, opacity: 0.3 }} />
                <div className="h-3 w-8 rounded" style={{ backgroundColor: "#6C63FF" }} />
              </div>
            </div>
            <div className="px-2.5 py-2 bg-card flex items-center justify-between gap-1">
              <div className="min-w-0">
                <p className="text-xs font-bold">{t.label}</p>
                <p className="text-[10px] text-ink-dim truncate">{t.desc}</p>
              </div>
              {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
