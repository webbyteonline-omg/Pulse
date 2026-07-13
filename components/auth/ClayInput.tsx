"use client";

import { forwardRef, useId, type ComponentType } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClayInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: ComponentType<LucideProps>;
  /** Static suffix shown at the right, e.g. "@bennett.edu.in". */
  suffix?: string;
  /** Interactive right element, e.g. a show/hide-password toggle. */
  rightSlot?: React.ReactNode;
  error?: string;
}

/**
 * DockIn clay text field — raised soft input with a leading violet icon,
 * matching the signup / login mockups. Theme-aware (light/dark/amoled).
 */
export const ClayInput = forwardRef<HTMLInputElement, ClayInputProps>(function ClayInput(
  { icon: Icon, suffix, rightSlot, error, className, id, ...props },
  ref
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className="w-full">
      <div
        className={cn(
          "clay-soft flex items-center gap-3 rounded-2xl px-4 py-3.5 transition",
          "focus-within:ring-2 focus-within:ring-clay-purple/40",
          error && "ring-2 ring-clay-red/50"
        )}
      >
        <Icon className="size-5 shrink-0 text-clay-purple" strokeWidth={2.2} aria-hidden />
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-faint focus:outline-none",
            className
          )}
          {...props}
        />
        {suffix && <span className="shrink-0 text-sm font-semibold text-clay-purple">{suffix}</span>}
        {rightSlot}
      </div>
      {error && (
        <p className="mt-1.5 px-1 text-xs text-clay-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
