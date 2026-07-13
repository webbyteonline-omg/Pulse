"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface WrappedStat {
  label: string;
  value: string;
  sub?: string;
  big?: boolean;
}

const GRADIENTS: Record<"daily" | "weekly" | "semester", string> = {
  daily: "linear-gradient(160deg, #2E2A72 0%, #6C63FF 55%, #9B4DFF 100%)",
  weekly: "linear-gradient(160deg, #7A1F3D 0%, #FF6584 55%, #FF9A76 100%)",
  semester: "linear-gradient(160deg, #7A5C00 0%, #E6B800 55%, #FFD700 100%)",
};

function CountUp({ value }: { value: string }) {
  // Animate the numeric part; keep prefix/suffix (₹, %, km) intact
  const match = value.match(/^([^\d-]*)([\d,.]+)(.*)$/);
  const [display, setDisplay] = useState(match ? "0" : value);
  useEffect(() => {
    if (!match) return;
    const target = parseFloat((match[2] ?? "0").replace(/,/g, ""));
    const decimals = (match[2] ?? "").includes(".") ? 1 : 0;
    let frame: number;
    const start = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / 1100);
      const current = target * (1 - Math.pow(1 - p, 3));
      setDisplay(
        current.toLocaleString("en-IN", {
          maximumFractionDigits: decimals,
          minimumFractionDigits: 0,
        })
      );
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  if (!match) return <>{value}</>;
  return (
    <>
      {match[1]}
      {display}
      {match[3]}
    </>
  );
}

/**
 * Full-screen animated Wrapped card. Gradient per type, count-up numbers,
 * share via html2canvas → native share sheet, or download as PNG.
 */
export function WrappedShell({
  type,
  title,
  subtitle,
  stats,
  onClose,
}: {
  type: "daily" | "weekly" | "semester";
  title: string;
  subtitle: string;
  stats: WrappedStat[];
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);

  const capture = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
    });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  };

  const share = async () => {
    setSharing(true);
    try {
      const blob = await capture();
      if (!blob) return;
      const file = new File([blob], `pulse-${type}-wrapped.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My DockIn Wrapped" });
      } else {
        downloadBlob(blob);
      }
    } catch {
      // user cancelled share — fine
    } finally {
      setSharing(false);
    }
  };

  const download = async () => {
    setSharing(true);
    try {
      const blob = await capture();
      if (blob) downloadBlob(blob);
    } finally {
      setSharing(false);
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pulse-${type}-wrapped.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 h-11 w-11 grid place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <motion.div
          ref={cardRef}
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 220 }}
          className="w-full max-w-[340px] rounded-[24px] p-6 text-white shadow-2xl overflow-y-auto max-h-[75dvh]"
          style={{ background: GRADIENTS[type] }}
        >
          <div className="flex items-center gap-2 mb-1">
            <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden>
              <rect width="48" height="48" rx="14" fill="rgba(255,255,255,0.25)" />
              <path
                d="M9 26h7l3.5-9 6 15 4-10.5 2 4.5H39"
                stroke="white"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <span className="text-xs font-bold tracking-widest uppercase opacity-90">
              DockIn Wrapped
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          <p className="text-xs opacity-80 mb-5">{subtitle}</p>

          <div className="space-y-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.18 }}
                className="bg-white/12 rounded-2xl px-4 py-3 backdrop-blur-sm"
                style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
              >
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                  {stat.label}
                </p>
                <p className={`font-black tracking-tight ${stat.big ? "text-3xl" : "text-xl"}`}>
                  <CountUp value={stat.value} />
                </p>
                {stat.sub && <p className="text-[11px] opacity-80 mt-0.5">{stat.sub}</p>}
              </motion.div>
            ))}
          </div>

          <p className="mt-5 text-center text-[10px] opacity-70">
            made with DockIn · your college life, one screen
          </p>
        </motion.div>

        <div className="flex gap-2 mt-4">
          <Button onClick={share} loading={sharing}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button variant="secondary" onClick={download} disabled={sharing}>
            <Download className="h-4 w-4" /> PNG
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
