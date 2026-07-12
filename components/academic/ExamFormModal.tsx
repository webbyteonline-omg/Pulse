"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCreateExam } from "@/hooks/useAcademicWork";
import { todayIST } from "@/lib/utils";
import type { ExamType, Subject } from "@/lib/supabase/types";

export interface ExamFormModalProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
}

const EXAM_TYPES: Array<{ id: ExamType; label: string }> = [
  { id: "midterm", label: "Midterm" },
  { id: "final", label: "Final" },
  { id: "unit_test", label: "Unit Test" },
  { id: "practical", label: "Practical" },
  { id: "other", label: "Other" },
];

export function ExamFormModal({ open, onClose, subjects }: ExamFormModalProps) {
  const create = useCreateExam();
  const [title, setTitle] = useState("");
  const [examType, setExamType] = useState<ExamType>("midterm");
  const [date, setDate] = useState(todayIST());
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [syllabus, setSyllabus] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setExamType("midterm");
      setDate(todayIST());
      setSubjectId(null);
      setSyllabus("");
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the exam a title");
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        exam_type: examType,
        date,
        subject_id: subjectId,
        syllabus: syllabus.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save exam");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add exam">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Title"
          placeholder="Semester 4 Final — DBMS"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div>
          <p className="text-xs font-medium text-ink-dim mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {EXAM_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setExamType(t.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  examType === t.id ? "bg-primary text-white border-primary" : "border-line text-ink-dim"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {subjects.length > 0 && (
          <div>
            <p className="text-xs font-medium text-ink-dim mb-2">Subject (optional)</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSubjectId(null)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                  subjectId === null ? "bg-primary text-white border-primary" : "border-line text-ink-dim"
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
          placeholder="Units 1-5, previous year papers"
          value={syllabus}
          onChange={(e) => setSyllabus(e.target.value)}
        />

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={create.isPending}>
          Add exam
        </Button>
      </form>
    </Modal>
  );
}
