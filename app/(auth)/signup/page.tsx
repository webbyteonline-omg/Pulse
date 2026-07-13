"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, MailCheck, User } from "lucide-react";
import { ClayInput } from "@/components/auth/ClayInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { signupSchema } from "@/lib/schemas";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const EMAIL_DOMAIN = "@bennett.edu.in";

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
  const [name, setName] = useState("");
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
      options: { data: { name: parsed.data.name } },
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
        <div className="clay-purple-btn mb-5 flex size-16 items-center justify-center rounded-clay">
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
      <div className="pt-2">
        <button
          type="button"
          onClick={() => router.push("/welcome")}
          aria-label="Back"
          className="clay flex size-11 items-center justify-center rounded-2xl"
        >
          <ArrowLeft className="size-5 text-ink" strokeWidth={2.4} />
        </button>
      </div>

      {/* Hero illustration */}
      <div className="relative mx-auto mt-1 h-44 w-full max-w-xs">
        <Image
          src="/dockin/signup-hero.png"
          alt="Create your DockIn account"
          fill
          priority
          quality={90}
          sizes="320px"
          className="object-contain"
        />
      </div>

      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-ink">Create Your Account</h1>
      <p className="mx-auto mt-2 max-w-[17rem] text-center text-sm leading-relaxed text-ink-dim">
        Join DockIn and connect with fellow Bennettians.
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
          className="clay-purple-btn mt-1 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold disabled:opacity-70"
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              Create Account
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

      <GoogleButton />

      <p className="mt-6 pb-4 text-center text-sm text-ink-dim">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-clay-purple hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
