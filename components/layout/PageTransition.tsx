"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

/** Subtle fade on every route change — kept short so navigation feels instant. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
