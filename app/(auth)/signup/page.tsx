"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail, MailCheck, User } from "lucide-react";
import { ClayInput } from "@/components/auth/ClayInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useToast } from "@/hooks/useToast";
import { signupSchema } from "@/lib/schemas";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const EMAIL_DOMAIN = "@bennett.edu.in";

const USERNAME_SUGGESTIONS = ["ChaiBiscuit_404", "BackBencher_99", "NightOwl_Bhai"];

function buildEmail(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  return v.includes("@") ? v.toLowerCase() : `${v.toLowerCase()}${EMAIL_DOMAIN}`;
}

function friendlyAuthError(message: string): string {
  if (/already registered/i.test(message)) return "That email already has an account — sign in instead.";
  if (/password should be/i.test(message)) return "Password is too weak — use at least 6 characters.";
  if (/rate limit/i.test(message)) return "Too many attempts — wait a minute and try again.";
  return message;
}

export default function SignupPage() {
  const router = useRouter();
  const { toast, showToast } = useToast();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fullEmail = buildEmail(email);
    if (password !== confirm) {
      setErrors({ confirm: "Passwords don't match" });
      return;
    }

    const parsed = signupSchema.safeParse({ name, email: fullEmail, password });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ name: f.name?.[0], email: f.email?.[0], password: f.password?.[0] });
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { data: { name: parsed.data.name, username: username.trim() || undefined } },
    });
    setLoading(false);

    if (error) {
      setErrors({ form: friendlyAuthError(error.message) });
      return;
    }
    if (!data.session) {
      setNeedsConfirmation(true);
      return;
    }
    // New account with an active session → straight into avatar setup.
    router.replace("/avatar-setup");
    router.refresh();
  };

  const eyeBtn = (shown: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      aria-label={shown ? "Hide password" : "Show password"}
      className="shrink-0 p-1 text-ink-dim transition-colors hover:text-ink"
    >
      {shown ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
    </button>
  );

  if (needsConfirmation) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <div className="genz-gradient-btn mb-5 flex size-16 items-center justify-center rounded-clay">
          <MailCheck className="size-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-ink">Check your inbox</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-ink-dim">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-ink">{buildEmail(email)}</span>. Tap it, then sign in.
        </p>
        <Link
          href="/login"
          className="clay-soft mt-7 flex w-full max-w-xs items-center justify-center rounded-2xl py-3.5 text-[15px] font-semibold text-ink"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pb-safe pt-safe">
      {/* Back */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/welcome")}
          aria-label="Back"
          className="clay flex size-11 items-center justify-center rounded-2xl"
        >
          <ArrowLeft className="size-5 text-ink" strokeWidth={2.4} />
        </button>
        <span className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-ink-dim">
          <GraduationCap className="size-3.5" /> Bennett University
        </span>
      </div>

      <h1 className="mt-6 text-[32px] font-extrabold leading-[1.05] tracking-tight text-ink">
        Welcome to the block<span className="genz-gradient-text">.</span>
      </h1>
      <p className="mt-2.5 max-w-[19rem] text-sm leading-relaxed text-ink-dim">
        Sign up with your Bennett email to find your batch, your hostel, your people.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
        <ClayInput
          icon={User}
          type="text"
          autoComplete="name"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <ClayInput
          icon={Mail}
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder="Bennett Email"
          suffix={email.includes("@") ? undefined : EMAIL_DOMAIN}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <div>
          <ClayInput
            icon={User}
            type="text"
            autoComplete="off"
            placeholder="Pick a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-1.5 px-1">
            {USERNAME_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setUsername(s)}
                className="clay-soft rounded-full px-3 py-1.5 text-[11px] font-bold text-clay-purple"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <ClayInput
          icon={Lock}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          rightSlot={eyeBtn(showPassword, () => setShowPassword((v) => !v))}
        />
        <ClayInput
          icon={Lock}
          type={showConfirm ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          rightSlot={eyeBtn(showConfirm, () => setShowConfirm((v) => !v))}
        />

        {errors.form && (
          <p className="rounded-2xl bg-clay-red-dim px-4 py-3 text-sm font-medium text-clay-red" role="alert">
            {errors.form}
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="genz-gradient-btn mt-1 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="size-5" strokeWidth={2.5} />
            </>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium text-ink-dim">or continue with</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GoogleButton compact />
        <button
          type="button"
          onClick={() => showToast("Apple sign-in is coming soon 🍎")}
          className="clay-soft flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-ink"
        >
          <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-ink" aria-hidden>
            <path d="M16.365 1.43c0 1.14-.462 2.101-1.203 2.85-.797.812-2.098 1.446-3.16 1.363-.135-1.086.42-2.223 1.15-2.928.813-.79 2.19-1.37 3.213-1.285zm3.868 16.98c-.36.83-.532 1.2-.994 1.94-.646 1.037-1.557 2.328-2.686 2.34-1.003.011-1.26-.653-2.62-.645-1.362.008-1.643.658-2.65.647-1.13-.012-1.995-1.176-2.64-2.213-1.813-2.91-2.004-6.325-.885-8.144.794-1.288 2.048-2.043 3.227-2.043 1.199 0 1.953.66 2.945.66.963 0 1.548-.662 2.933-.662 1.05 0 2.16.572 2.951 1.56-2.594 1.421-2.174 5.13.42 6.505z" />
          </svg>
          Apple
        </button>
      </div>

      <p className="mt-6 pb-4 text-center text-sm text-ink-dim">
        Already on DockIn?{" "}
        <Link href="/login" className="font-semibold text-clay-purple hover:underline">
          Log in
        </Link>
      </p>

      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-bg shadow-2xl"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
