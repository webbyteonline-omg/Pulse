"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { FriendGroup } from "@/lib/supabase/types";

export interface InviteSheetProps {
  open: boolean;
  onClose: () => void;
  group: Pick<FriendGroup, "id" | "name" | "invite_code">;
}

export function InviteSheet({ open, onClose, group }: InviteSheetProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // window.location.origin, not a hardcoded domain — this app doesn't have
  // a fixed known production URL baked into the codebase, so building the
  // link at runtime from wherever it's actually being served is the only
  // way to get it right in every environment (local dev, preview, prod).
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const link = `${origin}/groups/join/${group.invite_code}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be denied/unavailable — silently no-op, the link
      // is still visible on screen to select manually.
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Join ${group.name} on DockIn`, url: link });
      } catch {
        // User cancelled the share sheet — not an error.
      }
    } else {
      void copyLink();
    }
  };

  const downloadQr = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 220;
      canvas.height = 220;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20, 180, 180);
      }
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${group.name.replace(/\s+/g, "-").toLowerCase()}-invite-qr.png`;
      a.click();
    };
    img.src = url;
  };

  return (
    <Modal open={open} onClose={onClose} title={`Invite to ${group.name}`}>
      <p className="text-sm text-ink-dim mb-4">Share this link with people you want to invite.</p>

      <div className="mb-5">
        <p className="text-xs font-medium text-ink-dim mb-2">Invite link</p>
        <div className="clay-inset rounded-input px-3.5 py-2.5 mb-2 overflow-hidden">
          <p className="text-xs font-mono text-ink truncate">{link}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => void copyLink()}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => void share()}>
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-medium text-ink-dim mb-2">QR code</p>
        <div ref={qrRef} className="inline-block p-4 rounded-card bg-white">
          {origin && <QRCodeSVG value={link} size={180} fgColor="#6C63FF" bgColor="transparent" />}
        </div>
        <p className="text-xs text-ink-dim mt-2 mb-3">Scan to join</p>
        <Button variant="ghost" size="sm" onClick={downloadQr} disabled={!origin}>
          <Download className="h-3.5 w-3.5" /> Download QR
        </Button>
      </div>
    </Modal>
  );
}
