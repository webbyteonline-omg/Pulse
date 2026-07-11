import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function AcademicLoading() {
  return (
    <div>
      <header className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="hidden md:block h-10 w-24 rounded-btn shrink-0" />
      </header>
      <Skeleton className="h-12 w-full rounded-btn mb-5" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Skeleton className="h-20 w-full rounded-card" />
        <Skeleton className="h-20 w-full rounded-card" />
      </div>

      <Skeleton className="h-24 w-full rounded-card mb-6" />

      <Skeleton className="h-11 w-full rounded-btn mb-3" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-8 w-20 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
        <Skeleton className="h-8 w-24 rounded-full shrink-0" />
      </div>

      <RowSkeleton rows={4} />
    </div>
  );
}
