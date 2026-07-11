import { CardSkeleton, RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

/** Pixel-matched skeleton for /dashboard — shown instantly during navigation. */
export default function DashboardLoading() {
  return (
    <div>
      <header className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-11 w-11 rounded-btn shrink-0" />
      </header>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <Skeleton className="h-32 w-full rounded-card" />
        <RowSkeleton rows={3} />
      </div>
    </div>
  );
}
