import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function AssignmentsLoading() {
  return (
    <div>
      <header className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="hidden md:block h-10 w-28 rounded-btn shrink-0" />
      </header>
      <Skeleton className="h-12 w-full rounded-btn mb-5" />
      <Skeleton className="h-9 w-full rounded-btn mb-4" />
      <RowSkeleton rows={4} />
    </div>
  );
}
