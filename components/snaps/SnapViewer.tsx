"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useMarkSnapViewed, type InboxSnap } from "@/hooks/useSnaps";

const VIEW_SECONDS = 8;

export function SnapViewer({ snap, onClose }: { snap: InboxSnap; onClose: () => void }) {
  const markViewed = useMarkSnapViewed();

  useEffect(() => {
    // Opening a snap consumes it (view-once) and starts the expiry timer.
    markViewed.mutate(snap.id);
    const t = setTimeout(onClose, VIEW_SECONDS * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap.id]);

  const name = snap.sender?.display_name ?? snap.sender?.username ?? "Someone";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex flex-col bg-black"
    >
      {/* Progress bar */}
      <div className="absolute inset-x-3 top-[calc(env(safe-area-inset-top,0px)+10px)] z-10 h-1 overflow-hidden rounded-full bg-white/25">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: VIEW_SECONDS, ease: "linear" }}
          className="h-full bg-white"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+22px)]">
        <div className="flex items-center gap-2.5">
          <Avatar name={name} size={36} src={snap.sender?.avatar_url} />
          <div>
            <p className="text-sm font-bold text-white">{name}</p>
            <p className="text-[11px] text-white/70">Snap · disappears in {VIEW_SECONDS}s</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close snap"
          className="flex size-10 items-center justify-center rounded-full bg-white/15 text-white"
        >
          <X className="size-5" strokeWidth={2.4} />
        </button>
      </div>

      {/* Image */}
      <button onClick={onClose} className="relative flex-1 cursor-pointer">
        <Image src={snap.image_url} alt="Snap" fill className="object-contain" unoptimized />
      </button>

      {/* Caption */}
      {snap.caption && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)] pt-12">
          <p className="text-center text-base font-bold text-white">{snap.caption}</p>
        </div>
      )}
    </motion.div>
  );
}
