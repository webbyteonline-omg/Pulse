"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signupSchema } from "@/lib/schemas";
import { getSupabaseBrowser } from "@/lib/supabase/client";

function friendlyAuthError(message: string): string {
  if (/already registered/i.test(message)) return "That email already has an account — sign in instead.";
  if (/password should be/i.test(message)) return "Password is too weak — use at least 6 characters.";
  if (/rate limit/i.test(message)) return "Too many attempts — wait a minute and try again.";
  return message;
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = signupSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setLoading(true);
    const supabase = getSupabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          name: parsed.data.name,
          username: username.trim().toLowerCase() || undefined,
        },
      },
    });
    setLoading(false);

    if (error) {
      setErrors({ form: friendlyAuthError(error.message) });
      return;
    }

    // If email confirmation is enabled there's no session yet
    if (!data.session) {
      setNeedsConfirmation(true);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  };

  if (needsConfirmation) {
    return (
      <AuthCard title="Check your inbox" subtitle="One last step">
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <MailCheck className="h-10 w-10 text-success" />
          <p className="text-sm text-ink-dim">
            We sent a confirmation link to <span className="text-ink font-medium">{email}</span>.
            Tap it, then sign in.
          </p>
          <Link href="/login" className="w-full">
            <Button variant="secondary" className="w-full mt-2">
              Back to sign in
            </Button>
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Attendance, deadlines & money — sorted">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Name"
          type="text"
          autoComplete="name"
          placeholder="Sachin Kumar"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="sachin_k (friends find you by this)"
          value={username}
          onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
          maxLength={20}
          hint="Letters, numbers and _ only — optional, we'll generate one otherwise"
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@college.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="p-1.5 text-ink-dim hover:text-ink transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        {errors.form && (
          <p className="text-sm text-danger bg-danger-dim border border-danger/30 rounded-input px-3 py-2" role="alert">
            {errors.form}
          </p>
        )}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-dim">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
