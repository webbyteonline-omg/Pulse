import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function ActivityLoading() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Skeleton className="h-9 w-9 rounded-btn" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="flex gap-2 overflow-x-auto mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
        ))}
      </div>
      <RowSkeleton rows={5} />
    </div>
  );
}
