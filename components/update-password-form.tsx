"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setError(null);

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/dashboard");
      router.refresh();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not update your password.");
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("kv-auth-page", className)} {...props}>
      <div className="kv-auth-heading">
        <span className="kv-auth-eyebrow">Secure your account</span>
        <h1 className="kv-auth-title">
          Choose a new <span className="kv-auth-title-accent">password</span>
        </h1>
        <p className="kv-auth-subtitle">
          Set a strong password to continue using KenvoryX.
        </p>
      </div>

      <section className="kv-auth-card" aria-label="Set a new password">
        <form className="kv-auth-form" onSubmit={handleUpdatePassword}>
          <div className="kv-auth-field">
            <label htmlFor="new-password" className="kv-auth-label">New password</label>
            <div className="kv-auth-input-frame">
              <LockKeyhole size={18} className="kv-auth-input-icon" aria-hidden="true" />
              <input
                id="new-password"
                name="new-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 8 characters"
                className="kv-auth-input"
              />
              <button
                type="button"
                className="kv-auth-visibility-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          <div className="kv-auth-field">
            <label htmlFor="confirm-new-password" className="kv-auth-label">Confirm new password</label>
            <div className="kv-auth-input-frame">
              <LockKeyhole size={18} className="kv-auth-input-icon" aria-hidden="true" />
              <input
                id="confirm-new-password"
                name="confirm-new-password"
                type={showConfirmation ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="Repeat your new password"
                className="kv-auth-input"
              />
              <button
                type="button"
                className="kv-auth-visibility-toggle"
                onClick={() => setShowConfirmation((current) => !current)}
                aria-label={showConfirmation ? "Hide confirmation password" : "Show confirmation password"}
                aria-pressed={showConfirmation}
              >
                {showConfirmation ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && <div role="alert" className="kv-auth-alert">{error}</div>}

          <button type="submit" className="kv-auth-submit" disabled={isLoading}>
            <span className="kv-auth-submit-content">
              {isLoading ? (
                <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Saving...</>
              ) : (
                <><KeyRound size={18} aria-hidden="true" /> Save new password</>
              )}
            </span>
          </button>
        </form>

        <div className="kv-auth-footer">
          <Link href="/auth/login" className="kv-auth-return-link">
            <ArrowLeft size={15} aria-hidden="true" /> Back to sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
