"use client";

import { motion } from "framer-motion";
import { PartyPopper, ShieldAlert, Target } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { bunkStats } from "@/lib/utils";
import type { Subject } from "@/lib/supabase/types";

export function BunkCalculator({ subject }: { subject: Subject }) {
  const { pct, canMiss, toReach } = bunkStats(
    subject.attended_classes,
    subject.total_classes,
    subject.required_percentage
  );

  if (subject.total_classes === 0) {
    return (
      <Card className="p-5 text-center">
        <p className="text-sm text-ink-dim">
          Mark a few classes and the bunk calculator will tell you exactly how many you
          can safely skip.
        </p>
      </Card>
    );
  }

  const below = pct < subject.required_percentage;
  const to75 = toReach(subject.required_percentage);
  const to80 = toReach(Math.min(subject.required_percentage + 5, 95));

  return (
    <Card className="p-5">
      <h3 className="text-sm font-bold text-ink-dim uppercase tracking-wider mb-4">
        Bunk calculator
      </h3>

      {below ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 rounded-btn bg-danger-dim border border-danger/25 p-4"
        >
          <ShieldAlert className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-danger">Recovery mode</p>
            <p className="mt-1 text-sm text-ink-dim">
              You need{" "}
              <span className="font-bold text-ink">
                {Number.isFinite(to75) ? to75 : "∞"} consecutive present
              </span>{" "}
              to climb back to {subject.required_percentage}%.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-start gap-3 rounded-btn bg-success-dim border border-success/25 p-4"
        >
          <PartyPopper className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-success">
              You can safely miss {canMiss} more {canMiss === 1 ? "class" : "classes"}
            </p>
            <p className="mt-1 text-sm text-ink-dim">
              …and still stay at or above {subject.required_percentage}%.
            </p>
          </div>
        </motion.div>
      )}

      <div className="mt-3 space-y-2.5">
        <TargetRow
          label={`To reach ${subject.required_percentage}%`}
          classes={to75}
          reached={pct >= subject.required_percentage}
        />
        <TargetRow
          label={`To reach ${Math.min(subject.required_percentage + 5, 95)}%`}
          classes={to80}
          reached={pct >= Math.min(subject.required_percentage + 5, 95)}
        />
      </div>
    </Card>
  );
}

function TargetRow({
  label,
  classes,
  reached,
}: {
  label: string;
  classes: number;
  reached: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-btn border border-line bg-bg px-3.5 py-2.5">
      <Target className="h-4 w-4 text-primary shrink-0" />
      <span className="flex-1 text-sm text-ink-dim">{label}</span>
      <span className="text-sm font-bold">
        {reached ? (
          <span className="text-success">Done ✓</span>
        ) : Number.isFinite(classes) ? (
          `attend next ${classes}`
        ) : (
          "not reachable"
        )}
      </span>
    </div>
  );
}
