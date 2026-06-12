"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Attaches an IntersectionObserver to reveal-on-scroll elements.
 * Re-scans when the DOM updates so dynamically mounted sections (e.g. ProductCatalog)
 * are not left at opacity 0.
 */
export function useScrollReveal(
  selector = ".reveal-up, .reveal-left, .reveal-right, .reveal-scale, .stagger-children, .rv, .process-timeline",
  threshold = 0.12
) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return;
    }

    const shouldDisable = window.matchMedia(
      "(max-width: 768px), (prefers-reduced-motion: reduce)"
    ).matches;

    const observed = new Set<Element>();

    const markInViewIfVisible = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        el.classList.add("in-view");
        return true;
      }
      return false;
    };

    let observer: IntersectionObserver | null = null;

    if (!shouldDisable) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              observer?.unobserve(entry.target);
              observed.delete(entry.target);
            }
          });
        },
        { threshold, rootMargin: "0px 0px -40px 0px" }
      );
    }

    const scan = () => {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        if (el.classList.contains("in-view")) return;

        if (shouldDisable) {
          el.classList.add("in-view");
          return;
        }

        if (markInViewIfVisible(el)) {
          return;
        }

        if (!observed.has(el)) {
          observed.add(el);
          observer?.observe(el);
        }
      });
    };

    scan();
    const retryTimers = [100, 400, 1000, 2500].map((ms) =>
      window.setTimeout(scan, ms)
    );

    const mutationObserver = new MutationObserver(() => scan());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      retryTimers.forEach(clearTimeout);
      mutationObserver.disconnect();
      observer?.disconnect();
      observed.clear();
    };
  }, [selector, threshold, pathname]);
}
