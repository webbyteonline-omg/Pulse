"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useImportEvents } from "@/hooks/useAcademic";
import { EVENT_TYPE_META, formatDate } from "@/lib/utils";
import type { ParsedCalendarEvent } from "@/lib/schemas";

type Stage =
  | { kind: "idle" }
  | { kind: "extracting"; fileName: string }
  | { kind: "parsing"; fileName: string }
  | { kind: "preview"; fileName: string; events: ParsedCalendarEvent[] }
  | { kind: "done"; count: number }
  | { kind: "error"; message: string };

interface UploadHistoryItem {
  fileName: string;
  count: number;
  at: string;
}

/** Extract text from a PDF client-side with PDF.js (dynamic import). */
async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const chunks: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    chunks.push(text);
  }
  return chunks.join("\n\n");
}

export function CalendarUpload() {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<UploadHistoryItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("pulse-upload-history") ?? "[]") as UploadHistoryItem[];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const importEvents = useImportEvents();

  const processFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") {
      setStage({ kind: "error", message: "Please upload a PDF file." });
      return;
    }
    try {
      setStage({ kind: "extracting", fileName: file.name });
      const text = await extractPdfText(file);
      if (text.trim().length < 40) {
        setStage({
          kind: "error",
          message: "Couldn't read text from this PDF — it may be scanned. Try a text-based PDF.",
        });
        return;
      }

      setStage({ kind: "parsing", fileName: file.name });
      const res = await fetch("/api/parse-calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Calendar parsing failed");
      }
      const { events } = (await res.json()) as { events: ParsedCalendarEvent[] };
      if (events.length === 0) {
        setStage({ kind: "error", message: "No events found in this PDF. Try a different calendar." });
        return;
      }
      setStage({ kind: "preview", fileName: file.name, events });
    } catch (err) {
      setStage({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }, []);

  const confirmImport = async () => {
    if (stage.kind !== "preview") return;
    try {
      const count = await importEvents.mutateAsync(stage.events);
      const item: UploadHistoryItem = {
        fileName: stage.fileName,
        count,
        at: new Date().toISOString().slice(0, 10),
      };
      const next = [item, ...history].slice(0, 5);
      setHistory(next);
      localStorage.setItem("pulse-upload-history", JSON.stringify(next));
      setStage({ kind: "done", count });
    } catch (err) {
      setStage({
        kind: "error",
        message: err instanceof Error ? err.message : "Import failed",
      });
    }
  };

  return (
    <Card className="p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider">
          Import academic calendar
        </h2>
      </div>

      <AnimatePresence mode="wait">
        {stage.kind === "idle" || stage.kind === "error" ? (
          <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) void processFile(file);
              }}
              className={`w-full rounded-card border-2 border-dashed p-8 flex flex-col items-center gap-2 transition-colors ${
                dragOver ? "border-primary bg-primary-dim" : "border-line hover:border-primary/50"
              }`}
            >
              <UploadCloud className="h-8 w-8 text-primary" />
              <p className="text-sm font-semibold">Drop your calendar PDF here</p>
              <p className="text-xs text-ink-dim">
                Gemini reads it and imports every exam, holiday & deadline
              </p>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void processFile(file);
                e.target.value = "";
              }}
            />
            {stage.kind === "error" && (
              <p className="mt-3 text-sm text-danger bg-danger-dim border border-danger/30 rounded-input px-3 py-2" role="alert">
                {stage.message}
              </p>
            )}
          </motion.div>
        ) : stage.kind === "extracting" || stage.kind === "parsing" ? (
          <motion.div
            key="working"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-8"
          >
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-semibold">
              {stage.kind === "extracting" ? "Reading PDF…" : "Gemini is finding your events…"}
            </p>
            <p className="text-xs text-ink-dim">{stage.fileName}</p>
          </motion.div>
        ) : stage.kind === "preview" ? (
          <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold">
                Found {stage.events.length} events — confirm import?
              </p>
              <button
                onClick={() => setStage({ kind: "idle" })}
                aria-label="Cancel"
                className="p-1.5 text-ink-dim hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 mb-4">
              {stage.events.map((event, i) => {
                const meta = EVENT_TYPE_META[event.type];
                return (
                  <div
                    key={`${event.date}-${i}`}
                    className="flex items-center gap-2.5 rounded-input bg-input border border-line px-3 py-2"
                  >
                    <Badge color={meta.color}>{meta.label}</Badge>
                    <span className="flex-1 min-w-0 text-xs font-medium truncate">{event.title}</span>
                    <span className="text-[11px] text-ink-dim shrink-0">{formatDate(event.date)}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setStage({ kind: "idle" })}>
                Cancel
              </Button>
              <Button className="flex-1" loading={importEvents.isPending} onClick={confirmImport}>
                Import {stage.events.length} events
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2 py-6"
          >
            <CheckCircle2 className="h-10 w-10 text-success" />
            <p className="text-sm font-bold">Imported {stage.count} events 🎉</p>
            <Button variant="ghost" size="sm" onClick={() => setStage({ kind: "idle" })}>
              Upload another
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && stage.kind === "idle" && (
        <div className="mt-4 pt-4 border-t border-line">
          <p className="text-[11px] font-bold text-ink-faint uppercase tracking-wider mb-2">
            Upload history
          </p>
          <div className="space-y-1.5">
            {history.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-ink-dim">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 min-w-0 truncate">{item.fileName}</span>
                <span>{item.count} events</span>
                <span className="text-ink-faint">{item.at}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
