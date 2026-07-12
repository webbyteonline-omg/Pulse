"use client";

import { Modal } from "@/components/ui/Modal";
import { RowSkeleton } from "@/components/ui/Skeleton";

/**
 * Placeholder — full implementation (Friend Requests / Attendance Alerts /
 * Coming Up sections, empty state, parallel data fetch) is wired up in a
 * follow-up pass. This stub keeps the dashboard's bell button functional
 * (opens in place, no navigation) in the meantime.
 */
export function NotificationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Notifications">
      <RowSkeleton rows={3} />
    </Modal>
  );
}
