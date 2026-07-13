"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePushPromptOnce } from "@/hooks/useNotifications";

/** Gentle one-time card asking to enable push notifications. */
export function PushPrompt() {
  const { show, accept, dismiss } = usePushPromptOnce();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:right-6 md:w-80 z-40 clay rounded-card p-4 shadow-2xl"
        >
          <div className="flex gap-3">
            <div className="h-10 w-10 shrink-0 rounded-btn bg-primary/15 grid place-items-center">
              <BellRing className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold">Never miss an exam</p>
              <p className="mt-0.5 text-xs text-ink-dim">
                Get reminders for exams, low attendance and budget limits.
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={accept} className="flex-1">
              Enable
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss} className="flex-1">
              Maybe later
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
