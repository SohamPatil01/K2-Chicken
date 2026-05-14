"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Attaches an IntersectionObserver to every element matching the selector
 * and adds the "in-view" class when the element enters the viewport.
 * Works with the CSS classes: reveal-up, reveal-left, reveal-right,
 * reveal-scale, stagger-children.
 *
 * Re-runs on route changes so client navigations (e.g. back to home) pick up
 * newly mounted reveal nodes; otherwise sections stay at opacity 0.
 */
export function useScrollReveal(
  selector = ".reveal-up, .reveal-left, .reveal-right, .reveal-scale, .stagger-children",
  threshold = 0.12
) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window))
      return;

    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (!elements.length) return;

    const shouldDisable =
      window.matchMedia("(max-width: 768px), (prefers-reduced-motion: reduce)")
        .matches;

    if (shouldDisable) {
      elements.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [selector, threshold, pathname]);
}
