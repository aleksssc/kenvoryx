"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";
import "./marketing-navigation.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/security", label: "Security" },
  { href: "/about", label: "About" },
] as const;

type Indicator = { left: number; width: number };

export function MarketingNavigation({ auth }: { auth: ReactNode }) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [indicator, setIndicator] = useState<Indicator | null>(null);
  const desktopNav = useRef<HTMLElement>(null);
  const mobileButton = useRef<HTMLButtonElement>(null);
  const firstMobileLink = useRef<HTMLAnchorElement>(null);

  const activeHref = links.find((link) =>
    link.href === "/" ? pathname === "/" : pathname === link.href || pathname.startsWith(`${link.href}/`)
  )?.href ?? "/";

  const highlightedHref = hovered ?? activeHref;

  // Measure the indicator before paint so a route change never flashes its old position.
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

    // Synchronous layout measurement prevents a one-frame flash on route changes.
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

  // End any transient hover after navigation. The active route takes over at the same location.
  useEffect(() => {
    setHovered(null);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    firstMobileLink.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        mobileButton.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="kv-site-header">
      <div className="kv-header-inner">
        <Link href="/" className="kv-header-brand" aria-label="Kenvoryx — Home" onClick={closeMobile}>
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
              aria-current={pathname === link.href ? "page" : undefined}
              data-highlighted={highlightedHref === link.href ? "true" : undefined}
              className="kv-nav-link"
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(link.href); }}
              onFocus={() => setHovered(link.href)}
              onBlur={() => setHovered(null)}
              // Keep the pill on the clicked link until pathname catches up; do not bounce to the previous route.
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
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      <div id="kv-mobile-menu" className="kv-mobile-menu" hidden={!mobileOpen}>
        <nav aria-label="Mobile navigation">
          {links.map((link, index) => (
            <Link
              ref={index === 0 ? firstMobileLink : undefined}
              key={link.href}
              href={link.href}
              className="kv-mobile-link"
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={closeMobile}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="kv-mobile-auth">{auth}</div>
      </div>
    </header>
  );
}
