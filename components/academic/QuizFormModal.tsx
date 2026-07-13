"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCreateQuiz } from "@/hooks/useAcademicWork";
import { todayIST } from "@/lib/utils";
import type { Subject } from "@/lib/supabase/types";

export interface QuizFormModalProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
}

export function QuizFormModal({ open, onClose, subjects }: QuizFormModalProps) {
  const create = useCreateQuiz();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayIST());
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDate(todayIST());
      setSubjectId(null);
      setSyllabus("");
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the quiz a title");
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        date,
        subject_id: subjectId,
        syllabus: syllabus.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save quiz");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add quiz">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Unit Test 2 — OS"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {subjects.length > 0 && (
          <div>
            <p className="text-xs font-medium text-ink-dim mb-2">Subject (optional)</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSubjectId(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  subjectId === null ? "clay-purple-btn border-primary" : "border-line text-ink-dim"
                }`}
              >
                None
              </button>
              {subjects.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSubjectId(s.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border transition-colors"
                  style={{
                    backgroundColor: subjectId === s.id ? `${s.color}26` : "transparent",
                    borderColor: subjectId === s.id ? s.color : "rgb(var(--line))",
                    color: subjectId === s.id ? s.color : "rgb(var(--ink-dim))",
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <Input
          label="Syllabus (optional)"
          placeholder="Chapters 4-6"
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
        />

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={create.isPending}>
          Add quiz
        </Button>
      </form>
    </Modal>
  );
}
