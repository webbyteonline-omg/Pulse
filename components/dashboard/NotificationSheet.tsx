"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { RowSkeleton } from "@/components/ui/Skeleton";
import { Avatar } from "@/components/friends/OnlineIndicator";
import { useEvents } from "@/hooks/useAcademic";
import { useAssignments, useQuizzes } from "@/hooks/useAcademicWork";
import { useSubjects } from "@/hooks/useAttendance";
import { useFriendRequests, useRespondToRequest } from "@/hooks/useFriends";
import { useTodayClasses } from "@/hooks/useTimetable";
import { attendancePercent, daysUntil } from "@/lib/utils";
import { formatTime } from "@/components/timetable/SlotCard";

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const requestsQuery = useFriendRequests();
  const subjectsQuery = useSubjects();
  const eventsQuery = useEvents();
  const assignmentsQuery = useAssignments();
  const quizzesQuery = useQuizzes();
  const todayClassesQuery = useTodayClasses();
  const respond = useRespondToRequest();

  const loading =
    requestsQuery.isLoading ||
    subjectsQuery.isLoading ||
    eventsQuery.isLoading ||
    assignmentsQuery.isLoading ||
    quizzesQuery.isLoading ||
    todayClassesQuery.isLoading;

  const incoming = useMemo(
    () => (requestsQuery.data ?? []).filter((r) => r.direction === "incoming"),
    [requestsQuery.data]
  );

  const attendanceAlerts = useMemo(() => {
    const subjects = subjectsQuery.data ?? [];
    return subjects
      .filter((s) => s.total_classes > 0)
      .map((s) => ({
        subject: s,
        pct: attendancePercent(s.attended_classes, s.total_classes),
      }))
      .filter((x) => x.pct < 75)
      .sort((a, b) => a.pct - b.pct);
  }, [subjectsQuery.data]);

  const upcomingItems = useMemo(() => {
    const items: Array<{ id: string; emoji: string; text: string }> = [];

    for (const slot of todayClassesQuery.data ?? []) {
      items.push({
        id: `class-${slot.id}`,
        emoji: "📚",
        text: `Class at ${formatTime(slot.start_time)}${slot.room ? ` in ${slot.room}` : ""}`,
      });
    }

    for (const e of eventsQuery.data ?? []) {
      const d = daysUntil(e.date);
      if (e.event_type === "exam" && d >= 0 && d <= 7) {
        items.push({ id: `event-${e.id}`, emoji: "⚠️", text: `${e.title} exam in ${d === 0 ? "today" : `${d}d`}` });
      }
    }

    for (const q of quizzesQuery.data ?? []) {
      const d = daysUntil(q.date);
      if (q.status === "upcoming" && d >= 0 && d <= 3) {
        items.push({
          id: `quiz-${q.id}`,
          emoji: "📝",
          text: `${q.title} quiz ${d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d}d`}`,
        });
      }
    }

    for (const a of assignmentsQuery.data ?? []) {
      const d = daysUntil(a.due_date);
      if ((a.status === "pending" || a.status === "submitted") && d >= 0 && d <= 2) {
        items.push({
          id: `assignment-${a.id}`,
          emoji: "📋",
          text: `${a.title} due ${d === 0 ? "today" : d === 1 ? "tomorrow" : `in ${d}d`}`,
        });
      }
    }

    return items;
  }, [todayClassesQuery.data, eventsQuery.data, quizzesQuery.data, assignmentsQuery.data]);

  const isEmpty =
    !loading && incoming.length === 0 && attendanceAlerts.length === 0 && upcomingItems.length === 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Notifications"
      titleAction={
        !isEmpty && (
          <button onClick={onClose} className="text-[13px] font-semibold text-primary">
            Mark all read
          </button>
        )
      }
    >
      <div className="max-h-[70dvh] overflow-y-auto -mx-1 px-1">
        {loading ? (
          <RowSkeleton rows={3} />
        ) : isEmpty ? (
          <div className="flex flex-col items-center text-center py-10 px-4">
            <div className="grid place-items-center h-14 w-14 rounded-full bg-success-dim mb-3">
              <Check className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm font-bold">You&apos;re all caught up!</p>
            <p className="text-xs text-ink-dim mt-1">No new notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {incoming.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-ink-dim uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  Friend Requests
                  <span className="grid place-items-center min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[10px] font-bold">
                    {incoming.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  <AnimatePresence initial={false}>
                    {incoming.map((request) => (
                      <motion.div
                        key={request.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="flex items-center gap-3 bg-input rounded-card p-3"
                      >
                        <Avatar
                          name={request.profile?.display_name ?? request.profile?.username ?? "?"}
                          userId={request.sender_id}
                          size={40}
                          src={request.profile?.avatar_url}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm leading-snug">
                            <span className="font-semibold">
                              {request.profile?.display_name ?? request.profile?.username ?? "Someone"}
                            </span>{" "}
                            sent you a friend request
                          </p>
                          <p className="text-[11px] text-ink-faint mt-0.5">{timeAgo(request.created_at)}</p>
                        </div>
                        <button
                          disabled={respond.isPending}
                          onClick={() => respond.mutate({ request, accept: true })}
                          aria-label="Accept"
                          className="h-9 w-9 grid place-items-center rounded-btn text-success transition-colors"
                          style={{ backgroundColor: "rgba(67,217,140,0.15)" }}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          disabled={respond.isPending}
                          onClick={() => respond.mutate({ request, accept: false })}
                          aria-label="Decline"
                          className="h-9 w-9 grid place-items-center rounded-btn border border-danger/40 text-danger transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {attendanceAlerts.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-ink-dim uppercase tracking-wider mb-2">
                  Attendance Alerts
                </h3>
                <div className="space-y-2">
                  {attendanceAlerts.map(({ subject, pct }) => {
                    const severe = pct < 65;
                    const color = severe ? "#FF5C5C" : "#FFB347";
                    return (
                      <div key={subject.id} className="flex items-start gap-3 bg-input rounded-card p-3">
                        <span className="grid place-items-center h-8 w-8 rounded-full shrink-0" style={{ backgroundColor: `${color}22` }}>
                          <AlertTriangle className="h-4 w-4" style={{ color }} />
                        </span>
                        <p className="text-sm leading-snug pt-1">
                          <span className="font-semibold">{subject.name}</span> attendance is at{" "}
                          <span className="font-bold" style={{ color }}>
                            {pct}%
                          </span>{" "}
                          — attend next class!
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {upcomingItems.length > 0 && (
              <section>
                <h3 className="text-xs font-bold text-ink-dim uppercase tracking-wider mb-2">Coming Up</h3>
                <div className="space-y-2">
                  {upcomingItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-input rounded-card p-3">
                      <span className="text-base shrink-0" aria-hidden>
                        {item.emoji}
                      </span>
                      <p className="text-sm flex-1 min-w-0">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
