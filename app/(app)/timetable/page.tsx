"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSubjects } from "@/hooks/useAttendance";
import { useAddSlot, useDeleteSlot, useTimetable } from "@/hooks/useTimetable";

const WeekGrid = dynamic(
  () => import("@/components/timetable/WeekGrid").then((m) => m.WeekGrid),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-card" /> }
);

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const router = useRouter();
  const timetableQuery = useTimetable();
  const subjectsQuery = useSubjects();
  const addSlot = useAddSlot();
  const deleteSlot = useDeleteSlot();

  const [addDay, setAddDay] = useState<number | null>(null);
  const [subjectId, setSubjectId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");
  const [error, setError] = useState<string | null>(null);

  const subjects = subjectsQuery.data ?? [];

  useEffect(() => {
    if (addDay !== null) {
      setSubjectId(subjects[0]?.id ?? "");
      setStartTime("09:00");
      setEndTime("10:00");
      setRoom("");
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addDay]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addDay === null) return;
    if (!subjectId) return setError("Pick a subject first.");
    if (startTime >= endTime) return setError("End time must be after start time.");
    try {
      await addSlot.mutateAsync({
        day_of_week: addDay,
        start_time: startTime,
        end_time: endTime,
        subject_id: subjectId,
        room: room.trim() || null,
      });
      setAddDay(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add class");
    }
  };

  return (
    <div>
      <Header title="Timetable" subtitle="Your weekly class schedule" />

      {timetableQuery.isLoading || subjectsQuery.isLoading ? (
        <Skeleton className="h-72 w-full rounded-card" />
      ) : subjects.length === 0 ? (
        <EmptyState
          illustration="subjects"
          title="Add subjects first"
          description="Your timetable is built from your subjects — add them in the Attendance tab, then come back."
          actionLabel="Go to Attendance"
          onAction={() => router.push("/attendance")}
        />
      ) : (
        <WeekGrid
          slots={timetableQuery.data ?? []}
          subjects={subjects}
          onAdd={(dow) => setAddDay(dow)}
          onDelete={(id) => deleteSlot.mutate(id)}
        />
      )}

      <Modal
        open={addDay !== null}
        onClose={() => setAddDay(null)}
        title={`Add class — ${addDay !== null ? DAY_NAMES[addDay] : ""}`}
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="slot-subject" className="block text-xs font-medium text-ink-dim mb-1.5">
              Subject
            </label>
            <select
              id="slot-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full h-11 px-3 rounded-input bg-input border border-line text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Starts" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            <Input label="Ends" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <Input
            label="Room (optional)"
            placeholder="LT-3"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            maxLength={20}
          />
          {error && (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={addSlot.isPending}>
            Add class
          </Button>
        </form>
      </Modal>
    </div>
  );
}
