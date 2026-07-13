"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, Loader2, RefreshCw, Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useFriends } from "@/hooks/useFriends";
import { useSendSnap } from "@/hooks/useSnaps";
import { useToast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

/**
 * Capture-first snap flow for the center FAB: opens the camera instantly,
 * then lets you caption and pick one or more friends to send to.
 */
export function SnapCameraSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const sendSnap = useSendSnap();
  const friendsQuery = useFriends();
  const friends = friendsQuery.data ?? [];
  const { toast, showToast } = useToast();

  // Open the camera instantly when the sheet opens with no photo yet.
  useEffect(() => {
    if (open && !file) {
      const t = setTimeout(() => inputRef.current?.click(), 150);
      return () => clearTimeout(t);
    }
  }, [open, file]);

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setCaption("");
    setSelected(new Set());
  };

  const close = () => {
    reset();
    onClose();
  };

  const pick = (f: File | null) => {
    if (!f) {
      if (!file) onClose();
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const send = async () => {
    if (!file || selected.size === 0) return;
    try {
      await Promise.all(
        [...selected].map((recipientId) =>
          sendSnap.mutateAsync({ recipientId, file, caption })
        )
      );
      showToast(`Snap sent to ${selected.size} ${selected.size === 1 ? "friend" : "friends"} 🎉`);
      setTimeout(close, 700);
    } catch {
      showToast("Couldn't send — try again");
    }
  };

  return (
    <Modal open={open} onClose={close} title="New Snap" variant="sheet">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />

      <div className="px-1 pb-2">
        {!preview ? (
          <button
            onClick={() => inputRef.current?.click()}
            className="clay-inset mx-auto flex aspect-[9/14] w-full max-w-[260px] flex-col items-center justify-center gap-3 rounded-clay text-ink-dim"
          >
            <span className="clay-purple-btn flex size-16 items-center justify-center rounded-full">
              <Camera className="size-7" />
            </span>
            <span className="text-sm font-semibold">Tap to capture</span>
          </button>
        ) : (
          <>
            <div className="relative mx-auto aspect-[9/14] w-full max-w-[260px] overflow-hidden rounded-clay">
              <Image src={preview} alt="Snap preview" fill className="object-cover" unoptimized />
              <button
                onClick={() => inputRef.current?.click()}
                aria-label="Retake"
                className="clay absolute right-2 top-2 flex size-9 items-center justify-center rounded-full text-ink"
              >
                <RefreshCw className="size-4" />
              </button>
              {caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                  <p className="text-center text-sm font-bold text-white">{caption}</p>
                </div>
              )}
            </div>

            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={80}
              placeholder="Add a caption…"
              className="clay-inset mt-3 w-full rounded-2xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-clay-purple/40"
            />

            <p className="mb-2 mt-4 text-sm font-bold text-ink">Send to</p>
            {friends.length === 0 ? (
              <p className="text-xs text-ink-dim">Add friends to send them snaps.</p>
            ) : (
              <div className="grid max-h-52 grid-cols-4 gap-3 overflow-y-auto no-scrollbar">
                {friends.map((f) => {
                  const name = f.display_name ?? f.username;
                  const on = selected.has(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => toggle(f.id)}
                      className="flex flex-col items-center gap-1"
                    >
                      <span className={cn("relative rounded-full", on && "ring-2 ring-clay-purple")}>
                        <Avatar name={name} size={52} src={f.avatar_url} showOnline={false} />
                        {on && (
                          <span className="clay-purple-btn absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-bg">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      <span className="max-w-full truncate text-[11px] font-semibold text-ink">{name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              onClick={send}
              disabled={selected.size === 0 || sendSnap.isPending}
              className="clay-purple-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold disabled:opacity-50"
            >
              {sendSnap.isPending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  Send Snap{selected.size > 0 ? ` (${selected.size})` : ""} <Send className="size-5" strokeWidth={2.4} />
                </>
              )}
            </button>
          </>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 clay rounded-full px-4 py-2.5 text-xs font-bold" role="status">
          {toast}
        </div>
      )}
    </Modal>
  );
}
