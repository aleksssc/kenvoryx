import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { ArrowLeft } from "lucide-react";
import "./auth-design.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="kv-auth-shell">
      <div className="kv-auth-visual" aria-hidden="true">
        <span className="kv-auth-light kv-auth-light-left" />
        <span className="kv-auth-light kv-auth-light-right" />
        <span className="kv-auth-orbit kv-auth-orbit-left" />
        <span className="kv-auth-orbit kv-auth-orbit-right" />
        <span className="kv-auth-dots" />
      </div>

      <header className="kv-auth-topbar">
        <div className="kv-auth-topbar-inner">
          <Link href="/" aria-label="KenvoryX home">
            <BrandLogo variant="lockup" />
          </Link>
          <Link href="/" className="kv-auth-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="kv-auth-main">{children}</main>
    </div>
  );
}
