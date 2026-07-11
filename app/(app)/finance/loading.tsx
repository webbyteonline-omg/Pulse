import { CardSkeleton, RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function FinanceLoading() {
  return (
    <div>
      <header className="flex items-start justify-between gap-3 mb-6">
        <Skeleton className="h-6 w-24" />
        <div className="hidden md:flex gap-2">
          <Skeleton className="h-10 w-10 rounded-btn" />
          <Skeleton className="h-10 w-20 rounded-btn" />
        </div>
      </header>

      <div className="flex items-center justify-center gap-3 mb-5">
        <Skeleton className="h-9 w-9 rounded-btn" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-9 rounded-btn" />
      </div>

      <div className="space-y-4">
        <CardSkeleton className="h-40" />
        <RowSkeleton rows={4} />
      </div>
    </div>
  );
}
