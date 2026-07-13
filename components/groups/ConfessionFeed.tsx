"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Send, VenetianMask } from "lucide-react";
import { useConfessions, useConfessionRealtime, usePostConfession } from "@/hooks/useConfessions";
import { useToast } from "@/hooks/useToast";

const MASKS = ["🦊", "🐼", "🦉", "🐨", "🐯", "🐸", "🦄", "🐧", "🐰", "🐹"];

function maskFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return MASKS[h % MASKS.length]!;
}

function ago(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function ConfessionFeed() {
  useConfessionRealtime();
  const confQuery = useConfessions();
  const post = usePostConfession();
  const { toast, showToast } = useToast();
  const [text, setText] = useState("");

  const confessions = confQuery.data ?? [];

  const submit = async () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      await post.mutateAsync(body);
      showToast("Posted anonymously 🤫");
    } catch {
      setText(body);
      showToast("Couldn't post — try again");
    }
  };

  return (
    <div>
      <h2 className="mb-3 flex items-center gap-2 text-[15px] font-bold text-ink">
        <VenetianMask className="size-4 text-clay-purple" /> Confessions
        <span className="rounded-full bg-clay-purple-dim px-2 py-0.5 text-[10px] font-bold text-clay-purple">
          Anonymous
        </span>
      </h2>

      {/* Composer */}
      <div className="clay mb-4 rounded-card p-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          rows={2}
          placeholder="Share something anonymously…"
          className="clay-inset w-full resize-none rounded-2xl px-3.5 py-3 text-[15px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-clay-purple/40"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-ink-faint">Nobody can see it&apos;s you.</span>
          <button
            onClick={submit}
            disabled={!text.trim() || post.isPending}
            className="clay-purple-btn flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold disabled:opacity-50"
          >
            {post.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Post
          </button>
        </div>
      </div>

      {/* Feed */}
      {confQuery.isLoading ? (
        <div className="clay rounded-card p-4 text-center text-sm text-ink-dim">Loading confessions…</div>
      ) : confessions.length === 0 ? (
        <div className="clay rounded-card p-6 text-center">
          <p className="text-sm font-semibold text-ink">No confessions yet</p>
          <p className="mt-1 text-xs text-ink-dim">Be the first to spill something 🤫</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {confessions.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="clay flex gap-3 rounded-card p-3.5"
            >
              <span className="clay-inset flex size-10 shrink-0 items-center justify-center rounded-full text-xl">
                {maskFor(c.id)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-ink">Anonymous</span>
                  <span className="text-[11px] text-ink-faint">· {ago(c.created_at)}</span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-snug text-ink">{c.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 clay rounded-full px-4 py-2.5 text-xs font-bold" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
