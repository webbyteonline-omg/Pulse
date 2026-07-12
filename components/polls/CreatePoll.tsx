"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { useCreatePoll } from "@/hooks/usePolls";

const EXPIRY_OPTIONS = [
  { label: "1 hour", hours: 1 },
  { label: "6 hours", hours: 6 },
  { label: "24 hours", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "No expiry", hours: 0 },
];

export function CreatePoll({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createPoll = useCreatePoll();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [anonymous, setAnonymous] = useState(false);
  const [expiryHours, setExpiryHours] = useState(24);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setQuestion("");
      setOptions(["", ""]);
      setAnonymous(false);
      setExpiryHours(24);
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim()) return setError("Ask a question first.");
    if (cleanOptions.length < 2) return setError("Add at least 2 options.");
    try {
      await createPoll.mutateAsync({
        question: question.trim(),
        options: cleanOptions,
        anonymous,
        expiresAt:
          expiryHours > 0 ? new Date(Date.now() + expiryHours * 3_600_000).toISOString() : null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create poll");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New poll">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Question"
          placeholder="Maggi at 2 AM — worth it?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={200}
        />

        <div>
          <p className="text-xs font-medium text-ink-dim mb-2">Options (2–4)</p>
          <div className="space-y-2">
            {options.map((option, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={option}
                  onChange={(e) =>
                    setOptions((prev) => prev.map((o, j) => (j === i ? e.target.value : o)))
                  }
                  maxLength={80}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`Remove option ${i + 1}`}
                    className="h-11 w-11 shrink-0 grid place-items-center rounded-input text-ink-faint hover:text-danger transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {options.length < 4 && (
            <button
              type="button"
              onClick={() => setOptions((prev) => [...prev, ""])}
              className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-primary min-h-[44px]"
            >
              <Plus className="h-3.5 w-3.5" /> Add option
            </button>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-ink-dim mb-2">Expires in</p>
          <div className="flex flex-wrap gap-2">
            {EXPIRY_OPTIONS.map((opt) => (
              <button
                key={opt.hours}
                type="button"
                onClick={() => setExpiryHours(opt.hours)}
                className={`px-3 py-2 rounded-full text-xs font-bold border transition-colors ${
                  expiryHours === opt.hours
                    ? "bg-primary-dim border-primary text-primary"
                    : "border-line text-ink-dim"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 py-1">
          <div className="flex-1">
            <p className="text-sm font-semibold">Anonymous voting</p>
            <p className="text-xs text-ink-dim">Voters&apos; names stay hidden</p>
          </div>
          <Toggle checked={anonymous} onChange={setAnonymous} label="Anonymous voting" />
        </div>

        {error && (
          <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-input px-3 py-2" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={createPoll.isPending}>
          Create poll
        </Button>
        <p className="text-[11px] text-ink-faint text-center">
          Visible to all your friends · max 5 polls a day
        </p>
      </form>
    </Modal>
  );
}
