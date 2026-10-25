import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { MarketingMotion } from "@/components/marketing/marketing-motion";
import "@/components/marketing/marketing-motion.css";
import { MarketingNavigation } from "@/components/marketing/marketing-navigation";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="kv-marketing-shell min-h-screen bg-zinc-950 text-white">
      <MarketingNavigation
        auth={
          <Suspense
            fallback={<div className="h-10 w-24 animate-pulse rounded-full bg-white/5" />}
          >
            <AuthButton />
          </Suspense>
        }
      />

      {/* Fixed floating header must not cover page content. */}
      <div className="kv-site-header-spacer" aria-hidden="true" />

      <MarketingMotion />
      {children}

      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-8 text-sm text-zinc-600">
          <span>© 2026 KenvoryX</span>
          <span>Infrastructure Monitoring Platform</span>
        </div>
      </footer>
    </div>
  );
}
