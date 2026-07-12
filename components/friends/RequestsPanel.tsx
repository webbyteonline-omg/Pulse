"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "./OnlineIndicator";
import { useFriendRequests, useRespondToRequest } from "@/hooks/useFriends";
import type { RequestWithProfile } from "@/hooks/useFriends";

/** Requests tab — Received (Accept/Decline) + Sent (Cancel) sections. */
export function RequestsPanel() {
  const requestsQuery = useFriendRequests();
  const respond = useRespondToRequest();

  const requests = requestsQuery.data ?? [];
  const incoming = requests.filter((r) => r.direction === "incoming");
  const outgoing = requests.filter((r) => r.direction === "outgoing");

  if (requestsQuery.isLoading) return <RowSkeleton rows={3} />;

  if (incoming.length === 0 && outgoing.length === 0) {
    return (
      <EmptyState
        illustration="generic"
        title="No pending requests"
        description="Friend requests you send or receive will show up here."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-3">
          Received {incoming.length > 0 && `(${incoming.length})`}
        </h2>
        {incoming.length === 0 ? (
          <p className="text-xs text-ink-faint">No incoming requests.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {incoming.map((request) => (
                <ReceivedRow
                  key={request.id}
                  request={request}
                  onAccept={() => respond.mutate({ request, accept: true })}
                  onDecline={() => respond.mutate({ request, accept: false })}
                  pending={respond.isPending}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-3">
          Sent {outgoing.length > 0 && `(${outgoing.length})`}
        </h2>
        {outgoing.length === 0 ? (
          <p className="text-xs text-ink-faint">No outgoing requests.</p>
        ) : (
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {outgoing.map((request) => (
                <SentRow key={request.id} request={request} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}

function ReceivedRow({
  request,
  onAccept,
  onDecline,
  pending,
}: {
  request: RequestWithProfile;
  onAccept: () => void;
  onDecline: () => void;
  pending: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex items-center gap-3 bg-card border border-primary/30 rounded-card p-3.5"
    >
      <Avatar
        name={request.profile?.display_name ?? request.profile?.username ?? "?"}
        userId={request.sender_id}
        size={40}
        src={request.profile?.avatar_url}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {request.profile?.display_name ?? request.profile?.username ?? "Someone"}
        </p>
        <p className="text-[11px] text-ink-dim">@{request.profile?.username ?? "unknown"}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.9 }}
        disabled={pending}
        onClick={onAccept}
        aria-label="Accept"
        className="h-11 w-11 grid place-items-center rounded-btn bg-success-dim text-success hover:bg-success/25 transition-colors"
        style={{ backgroundColor: "rgba(67,217,140,0.15)" }}
      >
        <Check className="h-5 w-5" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.9 }}
        disabled={pending}
        onClick={onDecline}
        aria-label="Decline"
        className="h-11 w-11 grid place-items-center rounded-btn border border-danger/40 text-danger hover:bg-danger/10 transition-colors"
      >
        <X className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}

function SentRow({ request }: { request: RequestWithProfile }) {
  const respond = useRespondToRequest();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="flex items-center gap-3 bg-card border border-line rounded-card p-3.5"
    >
      <Avatar
        name={request.profile?.display_name ?? request.profile?.username ?? "?"}
        size={36}
        showOnline={false}
        src={request.profile?.avatar_url}
      />
      <p className="flex-1 text-sm truncate">
        @{request.profile?.username ?? "unknown"}
      </p>
      <button
        disabled={respond.isPending}
        onClick={() => respond.mutate({ request, accept: false })}
        className="min-h-[36px] px-3 rounded-full border border-line text-[11px] font-bold text-ink-dim hover:text-danger hover:border-danger/40 transition-colors"
      >
        Cancel request
      </button>
    </motion.div>
  );
}
