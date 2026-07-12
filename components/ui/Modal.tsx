"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Optional extra control rendered next to the close button (e.g. "Mark all read"). */
  titleAction?: React.ReactNode;
  children: React.ReactNode;
  /** "sheet" slides from bottom on mobile; "center" is a centered dialog. */
  variant?: "sheet" | "center";
  className?: string;
}

/** Modal / bottom-sheet with backdrop, escape handling, body scroll lock. */
export function Modal({ open, onClose, title, titleAction, children, variant = "sheet", className }: ModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Android back button / edge-swipe fix: without this, there's no history
  // entry for "sheet open" so the hardware/gesture back falls through to
  // the browser's real history stack — on a PWA that often means bouncing
  // out to whatever page was visited before this one (e.g. Dashboard),
  // instead of just closing the sheet. Pushing a dummy state on open and
  // treating popstate as "close" fixes that: back now always closes the
  // sheet first, matching native app behavior.
  useEffect(() => {
    if (!open) return;
    window.history.pushState({ pulseSheet: true }, "");
    const onPopState = () => onClose();
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // If the sheet is closing for a reason OTHER than the popstate we
      // just listened for (e.g. the user tapped the X or submitted the
      // form), the dummy history entry we pushed is still sitting there —
      // clean it up so a later real back-press doesn't land on it and
      // no-op instead of leaving the page.
      if (window.history.state?.pulseSheet) window.history.back();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={variant === "sheet" ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 12 }}
            animate={variant === "sheet" ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={variant === "sheet" ? { y: "100%" } : { opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            onAnimationComplete={(definition) => {
              // Only focus once the OPEN animation lands, never on exit —
              // focusing (which opens the keyboard on mobile) while the
              // sheet is still sliding in is what caused it to visually
              // collide with the header; waiting for the spring to settle
              // fixes that without needing every form to hand-roll a delay.
              if (definition !== "animate") return;
              const first = bodyRef.current?.querySelector<HTMLElement>(
                "input, textarea, select, [contenteditable]"
              );
              first?.focus();
            }}
            className={cn(
              "relative w-full sm:max-w-md max-h-[92dvh] overflow-y-auto",
              "bg-card border border-line shadow-2xl",
              variant === "sheet"
                ? "rounded-t-card sm:rounded-card pb-safe"
                : "rounded-card mx-4",
              className
            )}
          >
            {variant === "sheet" && (
              <div className="sm:hidden pt-3 flex justify-center">
                <div className="h-1 w-10 rounded-full bg-line" />
              </div>
            )}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              {title && <h2 className="text-base font-bold">{title}</h2>}
              <div className="flex items-center gap-3 ml-auto">
                {titleAction}
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1.5 rounded-full text-ink-dim hover:text-ink hover:bg-line/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div ref={bodyRef} className="px-5 pb-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
