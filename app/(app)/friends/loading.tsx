import { RowSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function FriendsLoading() {
  return (
    <div>
      <header className="mb-6 space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-28" />
      </header>
      <Skeleton className="h-12 w-full rounded-btn mb-5" />
      <Skeleton className="h-12 w-full rounded-input mb-6" />
      <RowSkeleton rows={3} />
    </div>
  );
}
