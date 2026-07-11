"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { parseSMS, type ParsedSMS } from "@/lib/smsParser";
import { CATEGORY_META, formatINR } from "@/lib/utils";

export function SMSParser({
  onParsed,
  initialText = "",
}: {
  onParsed: (parsed: ParsedSMS) => void;
  initialText?: string;
}) {
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<ParsedSMS | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parse = () => {
    setError(null);
    const parsed = parseSMS(text);
    if (!parsed) {
      setResult(null);
      setError("Couldn't find an amount in that message. Check the text and try again.");
      return;
    }
    setResult(parsed);
  };

  return (
    <div className="space-y-4">
      <Textarea
        label="Paste your UPI SMS here"
        placeholder={'e.g. "Rs.340 sent to Sharma Tea Stall via GPay UPI Ref 4521…"'}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setResult(null);
          setError(null);
        }}
        rows={4}
      />
      <Button onClick={parse} disabled={!text.trim()} className="w-full" variant="secondary">
        <ScanLine className="h-4 w-4" /> Parse message
      </Button>

      {error && (
        <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-input px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-card border border-success/30 bg-success-dim p-4"
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-success mb-2">
            Parsed — confirm below
          </p>
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>
              {CATEGORY_META[result.category].emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg">{formatINR(result.amount, { decimals: true })}</p>
              <p className="text-xs text-ink-dim truncate">
                {result.merchant ?? "Unknown merchant"} · {CATEGORY_META[result.category].label}
              </p>
            </div>
            <Button size="sm" onClick={() => onParsed(result)}>
              Use this
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
