"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Mail,
  LockKeyhole,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="kv-auth-page kv-auth-page-login">
      <div className="kv-auth-heading">
        <span className="kv-auth-eyebrow">Welcome back</span>
        <h1 className="kv-auth-title">
          Sign in to Kenvory<span className="kv-auth-title-accent">X</span>
        </h1>
        <p className="kv-auth-subtitle">Monitor and manage your infrastructure.</p>
      </div>

      <section className="kv-auth-card" aria-label="Sign in">
        <form onSubmit={handleLogin} className="kv-auth-form">
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
            <div className="kv-auth-label-row">
              <label htmlFor="password" className="kv-auth-label">Password</label>
              <Link href="/auth/forgot-password" className="kv-auth-inline-link">
                Forgot password?
              </Link>
            </div>
            <div className="kv-auth-input-frame">
              <LockKeyhole size={18} className="kv-auth-input-icon" aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
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

          {error && <div role="alert" className="kv-auth-alert">{error}</div>}

          <button type="submit" disabled={loading} className="kv-auth-submit">
            <span className="kv-auth-submit-content">
            {loading ? (
              <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Signing in...</>
            ) : (
              <><LogIn size={18} aria-hidden="true" /> Sign in</>
            )}
          </span>
          </button>
        </form>

        <div className="kv-auth-footer">
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up">Create account</Link>
        </div>
      </section>
    </div>
  );
}
