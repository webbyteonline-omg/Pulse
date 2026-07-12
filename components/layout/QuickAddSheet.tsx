"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarPlus,
  Clock,
  Receipt,
  SmilePlus,
  Vote,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";

const ACTIONS = [
  { label: "Add Expense", desc: "Manual, SMS or screenshot", icon: Receipt, color: "#FF5C5C", href: "/finance/add" },
  { label: "Add Event", desc: "Exam, quiz or deadline", icon: CalendarPlus, color: "#6C63FF", href: "/academic?add=1" },
  { label: "Mark Attendance", desc: "Present or absent", icon: BarChart3, color: "#43D98C", href: "/attendance" },
  { label: "Add Class", desc: "To your timetable", icon: Clock, color: "#4FACFE", href: "/timetable" },
  { label: "Create Poll", desc: "Ask your friends", icon: Vote, color: "#FF6584", href: "/polls?create=1" },
  { label: "Daily Check-in", desc: "Mood + steps", icon: SmilePlus, color: "#FFB347", href: "/health" },
];

/** Center-FAB quick actions — every entry goes to a real flow. */
export function QuickAddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  return (
    <Modal open={open} onClose={onClose} title="Quick add">
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              onClose();
              router.push(action.href);
            }}
            className="flex flex-col items-start gap-2 rounded-card bg-input border border-line p-4 text-left min-h-[44px]"
          >
            <span
              className="grid place-items-center h-10 w-10 rounded-full"
              style={{ backgroundColor: `${action.color}22` }}
            >
              <action.icon className="h-5 w-5" style={{ color: action.color }} />
            </span>
            <span>
              <p className="text-sm font-bold leading-tight">{action.label}</p>
              <p className="text-[11px] text-ink-dim mt-0.5">{action.desc}</p>
            </span>
          </motion.button>
        ))}
      </div>
    </Modal>
  );
}
