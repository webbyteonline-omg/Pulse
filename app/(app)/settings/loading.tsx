import { Skeleton } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div>
      <header className="mb-6">
        <Skeleton className="h-6 w-28" />
      </header>
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-card p-4 clay space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-input" />
            <Skeleton className="h-10 w-full rounded-input" />
          </div>
        ))}
      </div>
    </div>
  );
}
