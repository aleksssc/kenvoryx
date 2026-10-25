import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";
import "./auth-design.css";

/**
 * Auth pages share the exact floating, responsive marketing navigation.
 * The form and its Supabase logic are intentionally untouched.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="kv-auth-shell kv-marketing-shell">
      <a href="#auth-content" className="kv-auth-skip-link">
        Skip to content
      </a>

      <div className="kv-auth-visual" aria-hidden="true">
        <span className="kv-auth-light kv-auth-light-left" />
        <span className="kv-auth-light kv-auth-light-right" />
        <span className="kv-auth-orbit kv-auth-orbit-left" />
        <span className="kv-auth-orbit kv-auth-orbit-right" />
        <span className="kv-auth-dots" />
        <span className="kv-auth-scan-line" />
      </div>

      <MarketingNavigation
        auth={
          <Suspense
            fallback={
              <div
                aria-hidden="true"
                className="h-10 w-24 animate-pulse rounded-full bg-white/5"
              />
            }
          >
            <AuthButton />
          </Suspense>
        }
      />

      <main id="auth-content" className="kv-auth-main" tabIndex={-1}>
        {children}
        <p className="kv-auth-signature" aria-hidden="true">
          Monitor <span /> Manage <span /> Secure
        </p>
      </main>
    </div>
  );
}
