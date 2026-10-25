"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Small, dependency-free viewport reveals for marketing pages.
 * Content stays visible without JavaScript or under reduced-motion settings.
 */
export function MarketingMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const page = document.querySelector<HTMLElement>("main.kv-subpage");
    if (!page) return;

    const targets = Array.from(page.querySelectorAll<HTMLElement>("[data-kv-reveal]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("kv-revealed");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.07, rootMargin: "0px 0px -22px 0px" },
    );

    targets.forEach((target, index) => {
      target.style.setProperty("--kv-reveal-delay", `${(index % 4) * 65}ms`);
      observer.observe(target);
    });

    page.classList.add("kv-motion-ready");

    return () => {
      observer.disconnect();
      page.classList.remove("kv-motion-ready");
      targets.forEach((target) => {
        target.classList.remove("kv-revealed");
        target.style.removeProperty("--kv-reveal-delay");
      });
    };
  }, [pathname]);

  return null;
}
