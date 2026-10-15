"use client";

import { useCallback, useRef } from "react";

/**
 * Pointer-follow tilt for cards. With a mouse or pen the card
 * leans toward the pointer and a soft light follows it (`.tilt` in
 * patterns/gesture/gesture.css reads --rx, --ry, --mx, --my). Touch gets a press-in
 * instead, because a finger covers the card. The CSS turns all of this off under
 * reduced motion; here we only write four variables, once per frame.
 */
export function useTilt<T extends HTMLElement>(max = 4) {
  const raf = useRef(0);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<T>) => {
      if (e.pointerType === "touch") return;
      const el = e.currentTarget;
      const { clientX, clientY } = e;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (clientX - r.left) / r.width; // 0 … 1, physical
        const py = (clientY - r.top) / r.height;
        el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
        el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
        el.style.setProperty("--mx", `${px * 100}%`);
        el.style.setProperty("--my", `${py * 100}%`);
        el.dataset.tilting = "";
      });
    },
    [max],
  );

  const onPointerLeave = useCallback((e: React.PointerEvent<T>) => {
    cancelAnimationFrame(raf.current);
    const el = e.currentTarget;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    delete el.dataset.tilting;
  }, []);

  return { onPointerMove, onPointerLeave };
}
