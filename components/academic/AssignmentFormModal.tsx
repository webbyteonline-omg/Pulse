"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCreateAssignment } from "@/hooks/useAcademicWork";
import { todayIST } from "@/lib/utils";
import type { Subject } from "@/lib/supabase/types";

export interface AssignmentFormModalProps {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
}

export function AssignmentFormModal({ open, onClose, subjects }: AssignmentFormModalProps) {
  const create = useCreateAssignment();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(todayIST());
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTitle("");
      setDueDate(todayIST());
      setSubjectId(null);
      setDescription("");
      setError(null);
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give the assignment a title");
      return;
    }
    try {
      await create.mutateAsync({
        title: title.trim(),
        due_date: dueDate,
        subject_id: subjectId,
        description: description.trim() || null,
      });
      onClose();
    } catch (err) {
      // Surface the real Postgres/Supabase error (RLS violation, missing
      // column, constraint failure, etc.) instead of a generic message —
      // this is what actually lets you diagnose "couldn't save" reports.
      console.error("Assignment insert failed:", err);
      setError(err instanceof Error ? err.message : "Couldn't save assignment");
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Add assignment">
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Title"
          placeholder="DBMS Lab Report 3"
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

        <Input
          label="Due date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <Input
          label="Notes (optional)"
          placeholder="Submit via portal, group of 3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" loading={create.isPending}>
          Add assignment
        </Button>
      </form>
    </Modal>
  );
}
