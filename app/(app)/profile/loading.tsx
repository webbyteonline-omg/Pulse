import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div>
      <header className="mb-6">
        <Skeleton className="h-6 w-24" />
      </header>

      <div className="rounded-card p-5 mb-5 flex items-center gap-4 clay">
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full shrink-0" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 p-4 rounded-card clay">
            <Skeleton className="h-11 w-11 rounded-btn shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
