"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useCreateSubject, useUpdateSubject } from "@/hooks/useAttendance";
import { subjectSchema } from "@/lib/schemas";
import { SUBJECT_COLORS } from "@/lib/utils";
import { useSettingsStore } from "@/store/settingsStore";
import type { Subject } from "@/lib/supabase/types";

export interface SubjectFormModalProps {
  open: boolean;
  onClose: () => void;
  subject?: Subject; // when provided → edit mode
}

export function SubjectFormModal({ open, onClose, subject }: SubjectFormModalProps) {
  const defaultRequired = useSettingsStore((s) => s.defaultRequiredPercentage);
  const create = useCreateSubject();
  const update = useUpdateSubject();

  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(SUBJECT_COLORS[0]);
  const [required, setRequired] = useState(defaultRequired);
  const [errors, setErrors] = useState<{ name?: string; required?: string; form?: string }>({});

  useEffect(() => {
    if (open) {
      setName(subject?.name ?? "");
      setColor(subject?.color ?? SUBJECT_COLORS[0]);
      setRequired(subject?.required_percentage ?? defaultRequired);
      setErrors({});
    }
  }, [open, subject, defaultRequired]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = subjectSchema.safeParse({ name, color, required_percentage: required });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ name: f.name?.[0], required: f.required_percentage?.[0] });
      return;
    }
    try {
      if (subject) {
        await update.mutateAsync({ id: subject.id, ...parsed.data });
      } else {
        await create.mutateAsync(parsed.data);
      }
      onClose();
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Kuch toh gadbad hai 💀" });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={subject ? "Edit subject" : "Add subject"}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Subject name"
          placeholder="Data Structures"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <div>
          <p className="text-xs font-medium text-ink-dim mb-2">Color</p>
          <div className="flex gap-2.5">
            {SUBJECT_COLORS.map((c) => (
              <motion.button
                key={c}
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
                className="h-9 w-9 rounded-full grid place-items-center border-2 transition-colors"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "#F0F0F5" : "transparent",
                }}
              >
                {color === c && <Check className="h-4 w-4 text-white" />}
              </motion.button>
            ))}
          </div>
        </div>

        <Input
          label="Required attendance %"
          type="number"
          min={1}
          max={100}
          value={required}
          onChange={(e) => setRequired(Number(e.target.value))}
          error={errors.required}
          hint="Most colleges require 75%"
        />

        {errors.form && (
          <p className="text-sm text-danger" role="alert">
            {errors.form}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={create.isPending || update.isPending}
        >
          {subject ? "Save changes" : "Add subject"}
        </Button>
      </form>
    </Modal>
  );
}
