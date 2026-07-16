"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Send, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useSendSnap } from "@/hooks/useSnaps";
import { useToast } from "@/hooks/useToast";

export function SendSnapSheet({
  open,
  onClose,
  friendId,
  friendName,
}: {
  open: boolean;
  onClose: () => void;
  friendId: string;
  friendName: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const sendSnap = useSendSnap();
  const { toast, showToast } = useToast();

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setCaption("");
  };

  const pick = (f: File | null) => {
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const close = () => {
    reset();
    onClose();
  };

  const send = async () => {
    if (!file) return;
    try {
      await sendSnap.mutateAsync({ recipientId: friendId, file, caption });
      reset();
      onClose();
    } catch {
      showToast("Couldn't send snap — try again");
    }
  };

  return (
    <Modal open={open} onClose={close} title={`Snap to ${friendName}`} variant="sheet">
      <div className="px-1 pb-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />

        {preview ? (
          <div className="relative mx-auto aspect-[9/14] w-full max-w-[280px] overflow-hidden rounded-clay">
            <Image src={preview} alt="Snap preview" fill className="object-cover" unoptimized />
            <button
              onClick={() => {
                if (preview) URL.revokeObjectURL(preview);
                setFile(null);
                setPreview(null);
              }}
              aria-label="Remove photo"
              className="clay absolute right-2 top-2 flex size-9 items-center justify-center rounded-full text-ink"
            >
              <X className="size-5" />
            </button>
            {caption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                <p className="text-center text-sm font-bold text-white">{caption}</p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="clay-inset flex aspect-[9/14] w-full max-w-[280px] mx-auto flex-col items-center justify-center gap-3 rounded-clay text-ink-dim"
          >
            <span className="clay-purple-btn flex size-16 items-center justify-center rounded-full">
              <Camera className="size-7" />
            </span>
            <span className="text-sm font-semibold">Tap to capture a snap</span>
          </button>
        )}

        {preview && (
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={80}
            placeholder="Add a caption…"
            className="clay-inset mt-4 w-full rounded-2xl px-4 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-clay-purple/40"
          />
        )}

        <button
          onClick={send}
          disabled={!file || sendSnap.isPending}
          className="genz-gradient-btn mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold disabled:opacity-50"
        >
          {sendSnap.isPending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Bhej de <Send className="size-5" strokeWidth={2.4} />
            </>
          )}
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 clay rounded-full px-4 py-2.5 text-xs font-bold" role="status">
          {toast}
        </div>
      )}
    </Modal>
  );
}
