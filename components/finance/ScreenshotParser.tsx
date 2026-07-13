"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImageUp, Loader2 } from "lucide-react";
import { SMSParser } from "./SMSParser";
import type { ParsedSMS } from "@/lib/smsParser";

type Stage =
  | { kind: "idle" }
  | { kind: "ocr"; progress: number }
  | { kind: "extracted"; text: string }
  | { kind: "error"; message: string };

export function ScreenshotParser({ onParsed }: { onParsed: (parsed: ParsedSMS) => void }) {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setStage({ kind: "error", message: "Please upload an image (PNG/JPG screenshot)." });
      return;
    }
    setStage({ kind: "ocr", progress: 0 });
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setStage({ kind: "ocr", progress: Math.round(m.progress * 100) });
          }
        },
      });
      const text = result.data.text.trim();
      if (text.length < 8) {
        setStage({ kind: "error", message: "Couldn't read text from that screenshot. Try a clearer one." });
        return;
      }
      setStage({ kind: "extracted", text });
    } catch {
      setStage({ kind: "error", message: "OCR failed — try again or use manual entry." });
    }
  };

  return (
    <div className="space-y-4">
      {stage.kind !== "extracted" && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={stage.kind === "ocr"}
            className="w-full rounded-card border-2 border-dashed border-line hover:border-primary/50 p-8 flex flex-col items-center gap-2 transition-colors disabled:opacity-60"
          >
            {stage.kind === "ocr" ? (
              <>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm font-semibold">Reading screenshot… {stage.progress}%</p>
                <div className="w-40 h-1.5 rounded-full bg-line overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    animate={{ width: `${stage.progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <ImageUp className="h-8 w-8 text-primary" />
                <p className="text-sm font-semibold">Upload a payment screenshot</p>
                <p className="text-xs text-ink-dim">GPay / PhonePe / Paytm — OCR runs on your device</p>
              </>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void processImage(file);
              e.target.value = "";
            }}
          />
        </>
      )}

      {stage.kind === "error" && (
        <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-input px-3 py-2" role="alert">
          {stage.message}
        </p>
      )}

      {stage.kind === "extracted" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <div className="clay-inset rounded-input p-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint mb-1">
              Extracted text
            </p>
            <p className="text-xs text-ink-dim whitespace-pre-wrap max-h-28 overflow-y-auto">
              {stage.text}
            </p>
          </div>
          <SMSParser initialText={stage.text} onParsed={onParsed} />
          <button
            type="button"
            onClick={() => setStage({ kind: "idle" })}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Upload a different screenshot
          </button>
        </motion.div>
      )}
    </div>
  );
}
