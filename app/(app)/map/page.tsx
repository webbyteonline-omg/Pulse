"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/Skeleton";

// Leaflet touches `window` — client-only.
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-[58dvh] w-full rounded-card" />
    </div>
  ),
});

export default function MapPage() {
  return (
    <div>
      <Header title="Campus Map" subtitle="Navigate · Explore · Connect" />
      <MapView />
    </div>
  );
}
