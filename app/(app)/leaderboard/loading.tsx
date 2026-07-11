import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div>
      <header className="mb-6 space-y-2">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-44" />
      </header>
      <Skeleton className="h-12 w-full rounded-btn mb-5" />

      <div className="flex gap-2 mb-4">
        <Skeleton className="h-9 w-20 rounded-full shrink-0" />
        <Skeleton className="h-9 w-28 rounded-full shrink-0" />
        <Skeleton className="h-9 w-24 rounded-full shrink-0" />
      </div>

      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>

      <RowSkeleton rows={4} />
    </div>
  );
}
