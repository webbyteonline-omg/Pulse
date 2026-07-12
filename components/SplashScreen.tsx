"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PulseLogo } from "@/components/auth/AuthCard";

/**
 * Custom animated splash shown once per browser session, replacing the
 * default static PWA splash. Auto-dismisses after a short beat; parent
 * unmounts it entirely once onComplete fires.
 */
export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"logo" | "out">("logo");

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("out");
      setTimeout(onComplete, 400);
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase === "logo" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
          style={{ background: "#0D0D14" }}
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="grid place-items-center rounded-[20px]"
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg, #6C63FF, #4FACFE)",
            }}
          >
            <PulseLogo size={40} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-bold tracking-tight"
            style={{ fontSize: 28, color: "#FFFFFF", letterSpacing: -0.5 }}
          >
            Pulse
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{ fontSize: 13, color: "#8888A8" }}
          >
            Bennett University
          </motion.p>

          <div
            className="absolute overflow-hidden rounded-full"
            style={{ bottom: 60, width: 48, height: 2, background: "rgba(255,255,255,0.1)" }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="h-full w-full"
              style={{ background: "linear-gradient(90deg, transparent, #6C63FF, transparent)" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
