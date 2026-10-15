"use client";

import { useSyncExternalStore } from "react";

/**
 * Gesture physics ("motion with a body", from MoshLab): a tiny,
 * interruptible spring, velocity tracking and momentum projection. No
 * dependency: the whole thing is a rAF loop over a damped harmonic oscillator.
 */

export type SpringConfig = { stiffness?: number; damping?: number; mass?: number };

/** Gentle settle, ~5% overshoot. Matches --ease-spring in motion.css. */
export const SPRING_SOFT: SpringConfig = { stiffness: 260, damping: 24 };
/** Snappy return after a cancelled drag, almost no overshoot. */
export const SPRING_SNAP: SpringConfig = { stiffness: 420, damping: 36 };

/**
 * Animate a value from `from` to `to`, starting at `velocity` (units/s), and
 * call `onUpdate` every frame. Returns a stop function so a new gesture can
 * grab the value mid-flight (interruptible), and resolves when settled.
 */
export function spring(
  from: number,
  to: number,
  velocity: number,
  onUpdate: (v: number) => void,
  { stiffness = 260, damping = 24, mass = 1 }: SpringConfig = SPRING_SOFT,
): { stop: () => void; done: Promise<void> } {
  let x = from - to;
  let v = velocity;
  let raf = 0;
  let last = performance.now();
  let resolve!: () => void;
  const done = new Promise<void>((r) => (resolve = r));

  const tick = (now: number) => {
    // Fixed sub-steps keep the integration stable on slow frames.
    let dt = Math.min(0.064, (now - last) / 1000);
    last = now;
    while (dt > 0) {
      const h = Math.min(dt, 1 / 240);
      const a = (-stiffness * x - damping * v) / mass;
      v += a * h;
      x += v * h;
      dt -= h;
    }
    if (Math.abs(x) < 0.05 && Math.abs(v) < 0.5) {
      onUpdate(to);
      resolve();
      return;
    }
    onUpdate(to + x);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    stop: () => {
      cancelAnimationFrame(raf);
      resolve();
    },
    done,
  };
}

/** Velocity from the last ~100ms of pointer samples (px/s). */
export function velocityTracker() {
  const samples: { t: number; x: number; y: number }[] = [];
  return {
    push(x: number, y: number) {
      const t = performance.now();
      samples.push({ t, x, y });
      while (samples.length > 2 && t - samples[0].t > 100) samples.shift();
    },
    get(): { vx: number; vy: number } {
      if (samples.length < 2) return { vx: 0, vy: 0 };
      const a = samples[0];
      const b = samples[samples.length - 1];
      const dt = Math.max(1, b.t - a.t) / 1000;
      return { vx: (b.x - a.x) / dt, vy: (b.y - a.y) / dt };
    },
    reset() {
      samples.length = 0;
    },
  };
}

/** Where a flick would come to rest (iOS-style deceleration). */
export const project = (velocity: number, decelerationRate = 0.998) =>
  ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);

/** Rubber-band resistance past a limit, like iOS overscroll. */
export const rubberband = (overshoot: number, dimension: number, constant = 0.55) =>
  (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));

/**
 * A short tick on threshold crossings. Android Chrome only: iOS Safari has no
 * Vibration API (and Apple closed the `<input switch>` workaround in iOS 26.5).
 * Visual feedback always carries the same information.
 */
export function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator && !prefersReducedMotion()) {
    try {
      navigator.vibrate(ms);
    } catch {
      /* blocked before first user activation: fine */
    }
  }
}

const RM = "(prefers-reduced-motion: reduce)";
export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia(RM).matches;

/** Reactive reduced-motion preference (false on the server). */
export function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(RM);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    prefersReducedMotion,
    () => false,
  );
}
