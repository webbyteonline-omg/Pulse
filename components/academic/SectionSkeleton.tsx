import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

/** Suspense fallback for each Academics pill tab's section — shown instantly
 * on tab switch while that tab's own query resolves. */
export function SectionSkeleton() {
  return (
    <div>
      <Skeleton className="h-28 w-full rounded-card mb-4" />
      <RowSkeleton rows={4} />
    </div>
  );
}
