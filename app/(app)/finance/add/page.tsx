"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { SMSParser } from "@/components/finance/SMSParser";
import { useAddExpense } from "@/hooks/useFinance";
import { encryptJSON } from "@/lib/encryption";
import { expenseSchema } from "@/lib/schemas";
import { ALL_CATEGORIES, CATEGORY_META, todayIST } from "@/lib/utils";
import type { ParsedSMS } from "@/lib/smsParser";
import type { ExpenseCategory, ExpenseSource } from "@/lib/supabase/types";

// Tesseract.js (OCR) is very large — only fetch it if the user opens the
// screenshot tab.
const ScreenshotParser = dynamic(
  () => import("@/components/finance/ScreenshotParser").then((m) => m.ScreenshotParser),
  { ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-card" /> }
);

type Tab = "manual" | "sms" | "screenshot";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "manual", label: "Manual" },
  { id: "sms", label: "SMS paste" },
  { id: "screenshot", label: "Screenshot" },
];

export default function AddExpensePage() {
  const router = useRouter();
  const addExpense = useAddExpense();
  const [tab, setTab] = useState<Tab>("manual");
  const [source, setSource] = useState<ExpenseSource>("manual");

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState(todayIST());
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; form?: string }>({});
  const [saved, setSaved] = useState(false);

  const amountRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (tab === "manual") amountRef.current?.focus();
  }, [tab]);

  const applyParsed = (parsed: ParsedSMS, parsedSource: ExpenseSource) => {
    setAmount(String(parsed.amount));
    setCategory(parsed.category);
    setMerchant(parsed.merchant ?? "");
    setSource(parsedSource);
    setTab("manual");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = expenseSchema.safeParse({
      amount: Number(amount),
      category,
      merchant: merchant.trim() || null,
      note: note.trim() || null,
      date,
      source,
    });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ amount: f.amount?.[0] });
      return;
    }
    try {
      // Private notes are E2E-encrypted on-device before they leave the phone
      const payload = parsed.data.note
        ? { ...parsed.data, note: `enc:${await encryptJSON(parsed.data.note)}` }
        : parsed.data;
      await addExpense.mutateAsync(payload);
      setSaved(true);
      setTimeout(() => router.push("/finance"), 900);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Couldn't save expense" });
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 200 }}
        >
          <CheckCircle2 className="h-14 w-14 text-success" />
        </motion.div>
        <p className="font-bold">Expense saved</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => router.push("/finance")}
          aria-label="Back"
          className="p-2 -ml-2 rounded-btn text-ink-dim hover:text-ink hover:bg-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">Add expense</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-card border border-line rounded-btn p-1 mb-5">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 h-9 rounded-input text-xs font-bold transition-colors ${
              tab === t.id ? "bg-primary text-white" : "text-ink-dim hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "manual" && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="space-y-5"
        >
          {/* Big amount input */}
          <Card className="p-5">
            <label htmlFor="amount" className="block text-xs font-medium text-ink-dim mb-2">
              Amount
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-ink-dim">₹</span>
              <input
                ref={amountRef}
                id="amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent text-4xl font-black tracking-tight placeholder:text-ink-faint focus:outline-none"
              />
            </div>
            {errors.amount && (
              <p className="mt-2 text-xs text-danger" role="alert">
                {errors.amount}
              </p>
            )}
          </Card>

          {/* Category grid */}
          <div>
            <p className="text-xs font-medium text-ink-dim mb-2">Category</p>
            <div className="grid grid-cols-4 gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const active = category === cat;
                return (
                  <motion.button
                    key={cat}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setCategory(cat)}
                    className="flex flex-col items-center gap-1 rounded-btn border py-3 transition-colors"
                    style={{
                      backgroundColor: active ? `${meta.color}1f` : "#1A1A24",
                      borderColor: active ? meta.color : "#2A2A3A",
                    }}
                  >
                    <span className="text-lg" aria-hidden>
                      {meta.emoji}
                    </span>
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: active ? meta.color : "#8888A0" }}
                    >
                      {meta.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <Input
            label="Merchant (optional)"
            placeholder="Swiggy, chai tapri, …"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} max={todayIST()} />
          <Input
            label="Note (optional) 🔒"
            placeholder="Split with roommates"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            hint="Notes are encrypted on your device — not even the server can read them"
          />

          {errors.form && (
            <p className="text-sm text-danger" role="alert">
              {errors.form}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" loading={addExpense.isPending}>
            Save expense
          </Button>
        </motion.form>
      )}

      {tab === "sms" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <SMSParser onParsed={(parsed) => applyParsed(parsed, "sms")} />
        </motion.div>
      )}

      {tab === "screenshot" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <ScreenshotParser onParsed={(parsed) => applyParsed(parsed, "screenshot")} />
        </motion.div>
      )}
    </div>
  );
}
