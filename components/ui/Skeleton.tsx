import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-input bg-line/40 relative overflow-hidden",
        "before:absolute before:inset-0 before:bg-gradient-to-r",
        "before:from-transparent before:via-white/[0.06] before:to-transparent",
        "before:animate-shimmer before:bg-[length:400px_100%]",
        className
      )}
    />
  );
}

/** Skeleton matching a stat-card shape. */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("clay rounded-card p-4 space-y-3", className)}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/** Skeleton matching a list-row shape. */
export function RowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="clay rounded-card p-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-14" />
        </div>
      ))}
    </div>
  );
}
