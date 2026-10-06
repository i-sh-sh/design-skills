"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Segmented control with a sliding indicator (product-mode motion kit).
 * Radio semantics: arrow keys move the selection. The indicator is positioned
 * from the selected button's physical offset, so it works in both directions.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [ind, setInd] = useState<{ x: number; w: number } | null>(null);
  const [animate, setAnimate] = useState(false);
  const index = options.findIndex((o) => o.value === value);

  useLayoutEffect(() => {
    const place = () => {
      const el = refs.current[index];
      if (el) setInd({ x: el.offsetLeft, w: el.offsetWidth });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [index, options]);

  const move = (delta: number) => {
    const next = options[(index + delta + options.length) % options.length];
    setAnimate(true);
    onChange(next.value);
    refs.current[options.indexOf(next)]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative inline-flex rounded-lg border bg-card p-1"
      onKeyDown={(e) => {
        // In RTL, ArrowLeft moves forward in reading order
        const forward = document.dir === "rtl" ? "ArrowLeft" : "ArrowRight";
        const back = document.dir === "rtl" ? "ArrowRight" : "ArrowLeft";
        if (e.key === forward || e.key === "ArrowDown") { e.preventDefault(); move(1); }
        if (e.key === back || e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      }}
    >
      {ind && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-1 rounded-md bg-primary shadow-xs",
            animate && "transition-[translate,width] duration-[380ms] ease-spring",
          )}
          // offsetLeft is a physical measurement, so the indicator is anchored physically too.
          style={{ left: 0, width: ind.w, translate: `${ind.x}px 0` }} // logical-ok: measured physical offset
        />
      )}
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => { setAnimate(true); onChange(o.value); }}
          className={cn(
            "relative z-10 min-h-10 cursor-pointer rounded-md px-4 text-sm font-medium transition-colors duration-(--duration-fast)",
            o.value === value ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
