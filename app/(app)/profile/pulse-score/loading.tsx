import { Skeleton } from "@/components/ui/Skeleton";

export default function PulseScoreLoading() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Skeleton className="h-9 w-9 rounded-btn" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-52 w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
      </div>
    </div>
  );
}
