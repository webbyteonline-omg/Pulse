import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ExamsLoading() {
  return (
    <div>
      <header className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="hidden md:block h-10 w-24 rounded-btn shrink-0" />
      </header>
      <Skeleton className="h-12 w-full rounded-btn mb-5" />
      <Skeleton className="h-32 w-full rounded-card mb-6" />
      <Skeleton className="h-9 w-full rounded-btn mb-4" />
      <RowSkeleton rows={4} />
    </div>
  );
}
