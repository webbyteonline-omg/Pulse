"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
  gradient?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, interactive, gradient, children, ...props },
  ref
) {
  return (
    <motion.div
      ref={ref}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      className={cn(
        "bg-card border border-line rounded-card",
        gradient &&
          "bg-gradient-to-br from-card via-card to-primary/[0.07] border-line",
        interactive && "cursor-pointer transition-colors hover:bg-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
});
