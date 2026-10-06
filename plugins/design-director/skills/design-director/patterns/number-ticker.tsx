"use client";

import { useEffect, useRef } from "react";


/**
 * Counts up to `value` once on mount, with tabular digits. The final value is
 * what renders (server HTML and reduced motion); the count-up only animates
 * the text node, so React state never changes during the animation.
 */
export function NumberTicker({ value, duration = 1100, locale }: { value: number; duration?: number; locale?: string }) {
  const fmt = (n: number) => n.toLocaleString(locale);
  const ref = useRef<HTMLSpanElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || played.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    played.current = true;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = fmt(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      el.textContent = fmt(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fmt depends only on locale
  }, [value, duration, locale]);

  return (
    <span ref={ref} className="tabular-nums">
      {fmt(value)}
    </span>
  );
}
