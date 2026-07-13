"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { ClayInput } from "@/components/auth/ClayInput";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { loginSchema } from "@/lib/schemas";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const EMAIL_DOMAIN = "@bennett.edu.in";

function buildEmail(raw: string): string {
  const v = raw.trim();
  if (!v) return "";
  return v.includes("@") ? v.toLowerCase() : `${v.toLowerCase()}${EMAIL_DOMAIN}`;
}

function friendlyAuthError(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Wrong email or password. Try again?";
  if (/email not confirmed/i.test(message)) return "Check your inbox and confirm your email first.";
  if (/rate limit/i.test(message)) return "Too many attempts — wait a minute and try again.";
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const fullEmail = buildEmail(email);
    const parsed = loginSchema.safeParse({ email: fullEmail, password });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({ email: f.email?.[0], password: f.password?.[0] });
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);

    if (error) {
      setErrors({ form: friendlyAuthError(error.message) });
      return;
    }
    router.replace(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  };

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
      <div className="relative mx-auto mt-2 h-52 w-full max-w-xs">
        <Image
          src="/dockin/login-hero.png"
          alt="Secure login to DockIn"
          fill
          priority
          quality={90}
          sizes="320px"
          className="object-contain"
        />
      </div>

      <h1 className="text-center text-[26px] font-extrabold tracking-tight text-ink">Welcome Back!</h1>
      <p className="mx-auto mt-2 max-w-[17rem] text-center text-sm leading-relaxed text-ink-dim">
        Login with your Bennett email to continue to DockIn.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3" noValidate>
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
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="shrink-0 p-1 text-ink-dim transition-colors hover:text-ink"
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          }
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
              Login
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

      {/* Bennett-only notice */}
      <div className="clay-soft mt-5 flex items-start gap-3 rounded-2xl px-4 py-3.5">
        <span className="clay-purple-btn flex size-9 shrink-0 items-center justify-center rounded-xl">
          <ShieldCheck className="size-5" strokeWidth={2.4} />
        </span>
        <div>
          <p className="text-sm font-bold text-clay-purple">Bennett students only</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-dim">
            Use your official Bennett University email to access DockIn.
          </p>
        </div>
      </div>

      <p className="mt-6 pb-4 text-center text-sm text-ink-dim">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-clay-purple hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
