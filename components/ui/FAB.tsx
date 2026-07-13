"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export interface FABProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

/**
 * Floating action button — bottom right, above the mobile bottom nav.
 * Primary "add" actions live here on mobile (56px target).
 */
export function FAB({ onClick, label, icon }: FABProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileTap={{ scale: 0.88 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      onClick={onClick}
      aria-label={label}
      className="md:hidden fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full clay-purple-btn grid place-items-center shadow-[0_8px_28px_-6px_#6C63FFAA]"
    >
      {icon ?? <Plus className="h-6 w-6" />}
    </motion.button>
  );
}
