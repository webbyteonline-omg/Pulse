import { Skeleton } from "@/components/ui/Skeleton";

export default function TimetableLoading() {
  return (
    <div>
      <header className="mb-6 space-y-2">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-4 w-44" />
      </header>
      <Skeleton className="h-12 w-full rounded-btn mb-5" />
      <Skeleton className="h-72 w-full rounded-card" />
    </div>
  );
}
