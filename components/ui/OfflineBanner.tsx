"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CloudOff, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { pendingCount } from "@/lib/outbox";

type BannerState =
  | { kind: "hidden" }
  | { kind: "offline"; pending: number }
  | { kind: "syncing"; count: number };

/**
 * Yellow bar while offline ("changes will sync"), green flash on reconnect
 * ("Back online — syncing X changes").
 */
export function OfflineBanner() {
  const [state, setState] = useState<BannerState>({ kind: "hidden" });
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    const refreshPending = async () => {
      const n = await pendingCount();
      if (mounted && !navigator.onLine) setState({ kind: "offline", pending: n });
    };

    const onOffline = () => void refreshPending();
    const onOnline = async () => {
      const n = await pendingCount();
      if (!mounted) return;
      setState({ kind: "syncing", count: n });
      setTimeout(() => {
        if (mounted) setState({ kind: "hidden" });
        queryClient.invalidateQueries();
      }, 2500);
    };

    const onSWMessage = (event: MessageEvent) => {
      if (event.data?.type === "OUTBOX_REPLAYED") {
        queryClient.invalidateQueries();
      }
    };

    if (!navigator.onLine) void refreshPending();
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    navigator.serviceWorker?.addEventListener("message", onSWMessage);
    return () => {
      mounted = false;
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      navigator.serviceWorker?.removeEventListener("message", onSWMessage);
    };
  }, [queryClient]);

  return (
    <AnimatePresence>
      {state.kind !== "hidden" && (
        <motion.div
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          exit={{ y: -40 }}
          role="status"
          className={`fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-black pt-safe ${
            state.kind === "offline" ? "bg-warning" : "bg-success"
          }`}
        >
          {state.kind === "offline" ? (
            <>
              <CloudOff className="h-3.5 w-3.5" />
              You&apos;re offline — changes will sync when connected
              {state.pending > 0 && ` (${state.pending} pending)`}
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Back online — syncing {state.count > 0 ? `${state.count} changes…` : "…"}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
