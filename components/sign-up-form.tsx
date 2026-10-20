"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  UserRound,
  Mail,
  LockKeyhole,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function SignUpForm() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSignUp(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          full_name: name.trim(),
        },

        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/auth/sign-up-success");
  }

  return (
    <div className="kv-auth-page kv-auth-page-signup">
      <div className="kv-auth-heading">
        <span className="kv-auth-eyebrow">Create your account</span>
        <h1 className="kv-auth-title">
          Join Kenvory<span className="kv-auth-title-accent">X</span>
        </h1>
        <p className="kv-auth-subtitle">
          Start monitoring your infrastructure from one place.
        </p>
      </div>

      <section className="kv-auth-card" aria-label="Create your account">
        <form onSubmit={handleSignUp} className="kv-auth-form">
          <div className="kv-auth-field">
            <label htmlFor="name" className="kv-auth-label">Display name</label>
            <div className="kv-auth-input-frame">
              <UserRound size={18} className="kv-auth-input-icon" aria-hidden="true" />
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your display name"
                className="kv-auth-input"
              />
            </div>
          </div>

          <div className="kv-auth-field">
            <label htmlFor="email" className="kv-auth-label">Email</label>
            <div className="kv-auth-input-frame">
              <Mail size={18} className="kv-auth-input-icon" aria-hidden="true" />
              <input
                id="email"
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

          <div className="kv-auth-field">
            <label htmlFor="password" className="kv-auth-label">Password</label>
            <div className="kv-auth-input-frame">
              <LockKeyhole size={18} className="kv-auth-input-icon" aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
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
            <label htmlFor="confirm-password" className="kv-auth-label">Confirm password</label>
            <div className="kv-auth-input-frame">
              <LockKeyhole size={18} className="kv-auth-input-icon" aria-hidden="true" />
              <input
                id="confirm-password"
                name="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repeat your password"
                className="kv-auth-input"
              />
              <button
                type="button"
                className="kv-auth-visibility-toggle"
                onClick={() => setShowConfirmPassword((current) => !current)}
                aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          </div>

          {error && <div role="alert" className="kv-auth-alert">{error}</div>}

          <button type="submit" disabled={loading} className="kv-auth-submit">
            <span className="kv-auth-submit-content">
            {loading ? (
              <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Creating account...</>
            ) : (
              <><UserPlus size={18} aria-hidden="true" /> Create account</>
            )}
          </span>
          </button>
        </form>

        <div className="kv-auth-footer">
          Already have an account?{" "}
          <Link href="/auth/login">Sign in</Link>
        </div>
      </section>
    </div>
  );
}
