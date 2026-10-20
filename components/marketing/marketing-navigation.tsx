"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  House,
  Info,
  Layers3,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import "./marketing-navigation.css";

const links = [
  { href: "/", label: "Home", icon: House },
  { href: "/features", label: "Features", icon: Layers3 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/security", label: "Security", icon: ShieldCheck },
  { href: "/about", label: "About", icon: Info },
] as const;

type Indicator = { left: number; width: number };

export function MarketingNavigation({ auth }: { auth: ReactNode }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const desktopNav = useRef<HTMLElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const mobilePanel = useRef<HTMLDivElement>(null);

  const activeHref = links.find((link) =>
    link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`)
  )?.href ?? "/";

  const highlightedHref = hovered ?? activeHref;

  // Preserve the smoothly moving desktop indicator; measure before paint to avoid a route-change bounce.
  useLayoutEffect(() => {
    const nav = desktopNav.current;
    if (!nav) return;
    let frame = 0;

    const positionIndicator = () => {
      const selected = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a[data-nav-href]"))
        .find((item) => item.dataset.navHref === highlightedHref);
      if (!selected) return;
      const parent = nav.getBoundingClientRect();
      const current = selected.getBoundingClientRect();
      const left = current.left - parent.left;
      const width = current.width;
      setIndicator((previous) =>
        previous?.left === left && previous.width === width ? previous : { left, width }
      );
    };

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(positionIndicator);
    };

    positionIndicator();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleMeasure);
    observer?.observe(nav);
    window.addEventListener("resize", scheduleMeasure);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
    };
  }, [highlightedHref]);

  useEffect(() => {
    setHovered(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    // Focus the panel, not the first link: prevents the unwanted bright outline around Home.
    mobilePanel.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileButton.current?.focus({ preventScroll: true });
      }
    };

    const onOutsidePointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onOutsidePointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onOutsidePointerDown);
    };
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header ref={headerRef} className="kv-site-header" data-mobile-open={mobileOpen}>
      <div className="kv-header-inner">
        <Link href="/" className="kv-header-brand" aria-label="KenvoryX — Home" onClick={closeMobile}>
          <BrandLogo variant="lockup" />
        </Link>

        <nav
          ref={desktopNav}
          className="kv-desktop-nav"
          aria-label="Main navigation"
          onPointerLeave={() => setHovered(null)}
        >
          <span
            className="kv-nav-indicator"
            aria-hidden="true"
            style={indicator ? { transform: `translate3d(${indicator.left}px, 0, 0)`, width: indicator.width, opacity: 1 } : { opacity: 0 }}
          />
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-nav-href={link.href}
              aria-current={activeHref === link.href ? "page" : undefined}
              data-highlighted={highlightedHref === link.href ? "true" : undefined}
              className="kv-nav-link"
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(link.href); }}
              onFocus={() => setHovered(link.href)}
              onBlur={() => setHovered(null)}
              onClick={() => setHovered(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="kv-header-auth">{auth}</div>
        <button
          ref={mobileButton}
          className="kv-menu-toggle"
          type="button"
          aria-expanded={mobileOpen}
          aria-controls="kv-mobile-menu"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((previous) => !previous)}
        >
          {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      <div
        ref={mobilePanel}
        id="kv-mobile-menu"
        className="kv-mobile-menu"
        data-open={mobileOpen}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
        tabIndex={-1}
      >
        <div className="kv-mobile-menu-heading">Navigation</div>

        <nav className="kv-mobile-nav" aria-label="Mobile navigation">
          {links.map((link, index) => {
            const ItemIcon = link.icon;
            const isActive = activeHref === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="kv-mobile-link"
                data-active={isActive}
                style={{ animationDelay: `${index * 35}ms` }}
                aria-current={isActive ? "page" : undefined}
                onClick={closeMobile}
              >
                <span className="kv-mobile-link-icon"><ItemIcon size={18} aria-hidden="true" /></span>
                <span className="kv-mobile-link-label">{link.label}</span>

              </Link>
            );
          })}
        </nav>

        <div className="kv-mobile-auth">{auth}</div>
      </div>
    </header>
  );
}
