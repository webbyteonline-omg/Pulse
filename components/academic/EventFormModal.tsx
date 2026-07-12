"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCreateEvent } from "@/hooks/useAcademic";
import { eventSchema } from "@/lib/schemas";
import { EVENT_TYPE_META, todayIST } from "@/lib/utils";
import type { EventType, Subject } from "@/lib/supabase/types";

const EVENT_TYPES = Object.keys(EVENT_TYPE_META) as EventType[];

export function EventFormModal({
  open,
  onClose,
  subjects,
}: {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
}) {
  const create = useCreateEvent();
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<EventType>("exam");
  const [date, setDate] = useState(todayIST());
  const [subjectId, setSubjectId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{ title?: string; date?: string; form?: string }>({});

  useEffect(() => {
    if (open) {
      setTitle("");
      setEventType("exam");
      setDate(todayIST());
      setSubjectId("");
      setDescription("");
      setErrors({});
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = eventSchema.safeParse({
      title,
      event_type: eventType,
      date,
      subject_id: subjectId || null,
      description: description || null,
    });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ title: f.title?.[0], date: f.date?.[0] });
      return;
    }
    try {
      await create.mutateAsync(parsed.data);
      onClose();
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Something went wrong" });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add event">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Mid-sem exam"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <div>
          <p className="text-xs font-medium text-ink-dim mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((type) => {
              const meta = EVENT_TYPE_META[type];
              const active = eventType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setEventType(type)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
                  style={{
                    backgroundColor: active ? `${meta.color}26` : "transparent",
                    borderColor: active ? meta.color : "#2A2A3A",
                    color: active ? meta.color : "#8888A0",
                  }}
                >
                  {meta.emoji} {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          error={errors.date}
        />

        {subjects.length > 0 && (
          <div>
            <label htmlFor="event-subject" className="block text-xs font-medium text-ink-dim mb-1.5">
              Subject (optional)
            </label>
            <select
              id="event-subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full h-11 px-3 rounded-input bg-input border border-line text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">None</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Textarea
          label="Description (optional)"
          placeholder="Syllabus: units 1–3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {errors.form && (
          <p className="text-sm text-danger" role="alert">
            {errors.form}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={create.isPending}>
          Add event
        </Button>
      </form>
    </Modal>
  );
}
