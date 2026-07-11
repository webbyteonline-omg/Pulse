"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EyeOff, Lock, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { VoteBar } from "./VoteBar";
import { useDeletePoll, useVote, type PollWithMeta } from "@/hooks/usePolls";
import { useAuthStore } from "@/store/authStore";

function timeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Ended";
  const h = Math.floor(ms / 3_600_000);
  if (h >= 24) return `${Math.floor(h / 24)}d left`;
  if (h >= 1) return `${h}h left`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m left`;
}

export function PollCard({ poll, index = 0 }: { poll: PollWithMeta; index?: number }) {
  const user = useAuthStore((s) => s.user);
  const vote = useVote();
  const deletePoll = useDeletePoll();
  const [error, setError] = useState<string | null>(null);

  const isMine = poll.creator_id === user?.id;
  const hasVoted = poll.myVote !== null;
  const locked = poll.expired || hasVoted;
  const counts = poll.options.map((_, i) => poll.votes[String(i)] ?? 0);
  const maxCount = Math.max(...counts, 0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.25, 0.04 * index) }}
    >
      <Card className={`p-4 ${poll.expired ? "opacity-75" : ""}`}>
        <div className="flex items-center gap-2.5 mb-3">
          <Avatar
            name={poll.creator?.display_name ?? poll.creator?.username ?? "?"}
            userId={poll.creator_id}
            size={30}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-dim truncate">
              {isMine ? "You" : (poll.creator?.display_name ?? `@${poll.creator?.username ?? "?"}`)}
              {" · "}
              {poll.expires_at ? timeLeft(poll.expires_at) : "no expiry"}
            </p>
          </div>
          {poll.anonymous && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-ink-dim" title="Anonymous voting">
              <EyeOff className="h-3 w-3" /> Anon
            </span>
          )}
          {poll.expired && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-warning">
              <Lock className="h-3 w-3" /> Final
            </span>
          )}
          {isMine && (
            <button
              onClick={() => deletePoll.mutate(poll.id)}
              aria-label="Delete poll"
              className="p-2 -m-1 text-ink-faint hover:text-danger transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <p className="font-semibold mb-3 leading-snug">{poll.question}</p>

        <div className="space-y-2">
          {poll.options.map((option, i) => (
            <VoteBar
              key={i}
              label={option}
              count={counts[i] ?? 0}
              total={poll.totalVotes}
              isMyVote={poll.myVote === i}
              isWinner={(counts[i] ?? 0) === maxCount && maxCount > 0}
              disabled={locked}
              onVote={
                locked
                  ? undefined
                  : () =>
                      vote.mutate(
                        { poll, optionIndex: i },
                        { onError: (err) => setError(err.message) }
                      )
              }
            />
          ))}
        </div>

        {error && (
          <p className="mt-2 text-xs text-danger" role="alert">
            {error}
          </p>
        )}
        <p className="mt-2.5 text-[11px] text-ink-faint">
          {poll.totalVotes} {poll.totalVotes === 1 ? "vote" : "votes"}
          {!hasVoted && !poll.expired && " · tap an option to vote"}
        </p>
      </Card>
    </motion.div>
  );
}
