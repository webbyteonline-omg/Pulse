import { cn } from "@/lib/utils";

export interface BadgeProps {
  children: React.ReactNode;
  color?: string; // hex — used for tinted background + text
  className?: string;
}

/** Small tinted pill. Pass a hex color for a matching dim background. */
export function Badge({ children, color = "#8888A0", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
        className
      )}
      style={{ backgroundColor: `${color}22`, color }}
    >
      {children}
    </span>
  );
}
