"use client";

import { getSupabaseBrowser } from "./supabase/client";

/**
 * Offline outbox: when a mutation fails because the network is down we queue
 * the equivalent Supabase REST call in IndexedDB. The service worker replays
 * the queue on the `pulse-outbox-sync` background-sync event (or when the app
 * posts REPLAY_OUTBOX after coming back online).
 */

const DB_NAME = "pulse-outbox";
const STORE = "requests";

interface OutboxItem {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

function openOutbox(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function isNetworkError(err: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  const msg = err instanceof Error ? err.message : String(err);
  return /fetch failed|Failed to fetch|NetworkError|network request failed/i.test(msg);
}

/** Queue an insert to be replayed when connectivity returns. */
export async function queueInsert(
  table: string,
  payload: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseBrowser();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`;

  const item: OutboxItem = {
    url,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: anonKey,
      Authorization: `Bearer ${token ?? anonKey}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  };

  const db = await openOutbox();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).add(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  if ("serviceWorker" in navigator) {
    const reg = await navigator.serviceWorker.ready;
    const syncReg = reg as ServiceWorkerRegistration & {
      sync?: { register: (tag: string) => Promise<void> };
    };
    if (syncReg.sync) {
      syncReg.sync.register("pulse-outbox-sync").catch(() => undefined);
    }
  }
}
