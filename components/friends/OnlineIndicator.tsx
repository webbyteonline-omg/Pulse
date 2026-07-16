"use client";

import { useIsOnline } from "@/lib/realtime";

/** Green presence dot (Supabase Realtime presence). */
export function OnlineIndicator({ userId, size = 10 }: { userId: string; size?: number }) {
  const online = useIsOnline(userId);
  return (
    <span
      aria-label={online ? "Online" : "Offline"}
      className={`inline-block rounded-full border-2 border-card ${
        online ? "bg-success" : "bg-line"
      }`}
      style={{ width: size, height: size }}
    />
  );
}

export function Avatar({
  name,
  userId,
  size = 40,
  showOnline = true,
  src,
}: {
  name: string;
  userId?: string;
  size?: number;
  showOnline?: boolean;
  /** Avatar image URL (e.g. DiceBear). Falls back to initial circle. */
  src?: string | null;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full rounded-full bg-primary/15 object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full rounded-full genz-gradient text-white grid place-items-center font-bold"
          style={{ fontSize: size * 0.4 }}
        >
          {(name || "?").charAt(0).toUpperCase()}
        </div>
      )}
      {showOnline && userId && (
        <span className="absolute -bottom-0.5 -right-0.5">
          <OnlineIndicator userId={userId} />
        </span>
      )}
    </div>
  );
}
