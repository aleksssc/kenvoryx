"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      // The deployment origin must be added to the Supabase Auth redirect allowlist.
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (resetError) throw resetError;
      // Avoid exposing whether an email belongs to an existing account.
      setSuccess(true);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not send the reset email.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("kv-auth-page", className)} {...props}>
      <div className="kv-auth-heading">
        <span className="kv-auth-eyebrow">Account recovery</span>
        <h1 className="kv-auth-title">
          {success ? "Check your email" : <>Reset your <span className="kv-auth-title-accent">password</span></>}
        </h1>
        <p className="kv-auth-subtitle">
          {success
            ? "If this email is registered, you will receive a link to set a new password."
            : "Enter your email address and we will send you a secure reset link."}
        </p>
      </div>

      <section className="kv-auth-card" aria-label="Password recovery">
        {success ? (
          <div className="kv-auth-success" role="status">
            <span className="kv-auth-status-icon" aria-hidden="true">
              <CheckCircle2 size={26} />
            </span>
            <p className="kv-auth-success-title">Recovery email requested</p>
            <p className="kv-auth-success-description">
              Check your inbox and spam folder. The link will take you back to KenvoryX.
            </p>
            <button
              type="button"
              className="kv-auth-submit"
              onClick={() => { setSuccess(false); setError(null); }}
            >
              <span className="kv-auth-submit-content"><Send size={17} aria-hidden="true" /> Try another email</span>
            </button>
          </div>
        ) : (
          <form className="kv-auth-form" onSubmit={handleForgotPassword}>
            <div className="kv-auth-field">
              <label htmlFor="recovery-email" className="kv-auth-label">Email</label>
              <div className="kv-auth-input-frame">
                <Mail size={18} className="kv-auth-input-icon" aria-hidden="true" />
                <input
                  id="recovery-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="kv-auth-input"
                />
              </div>
            </div>

            {error && <div role="alert" className="kv-auth-alert">{error}</div>}

            <button type="submit" className="kv-auth-submit" disabled={isLoading}>
              <span className="kv-auth-submit-content">
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Sending...</>
                ) : (
                  <><Send size={18} aria-hidden="true" /> Send reset email</>
                )}
              </span>
            </button>
          </form>
        )}

        <div className="kv-auth-footer">
          <Link href="/auth/login" className="kv-auth-return-link">
            <ArrowLeft size={15} aria-hidden="true" /> Back to sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
