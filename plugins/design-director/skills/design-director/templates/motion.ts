"use client";

/**
 * design-director — Motion for React presets.
 * Mirrors the tokens in motion.css; keep both in sync.
 *
 *   npm i motion
 *   <MotionRoot dir={dir}>{children}</MotionRoot>   // once, in the root layout
 *
 * Save as e.g. `lib/motion.ts` (rename to .tsx only if you prefer JSX in MotionRoot).
 */

import { createContext, createElement, useContext, type ReactNode } from "react";
import { MotionConfig, type Transition, type Variants } from "motion/react";

/* ───────────── Tokens ───────────── */

/** Seconds (Motion uses seconds; CSS tokens use ms). */
export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.22,
  slow: 0.32,
  deliberate: 0.5,
  cinematic: 0.9,
} as const;

export const ease = {
  standard: [0.2, 0, 0, 1],
  enter: [0.05, 0.7, 0.1, 1],
  exit: [0.3, 0, 0.8, 0.15],
  expo: [0.16, 1, 0.3, 1],
} as const satisfies Record<string, readonly [number, number, number, number]>;

/** Springs described by perceived duration + bounce — easy to reason about. */
export const spring = {
  /** Product default: menus, tabs, toggles, layout. */
  snappy: { type: "spring", visualDuration: 0.25, bounce: 0 },
  /** Larger surfaces: drawers, expanding cards. */
  smooth: { type: "spring", visualDuration: 0.4, bounce: 0.1 },
  /** Playful / showcase only: success moments, hero details. */
  bouncy: { type: "spring", visualDuration: 0.5, bounce: 0.3 },
} as const satisfies Record<string, Transition>;

/** Exit transition: faster than entrances, accelerating away. */
export const exitTransition: Transition = { duration: duration.fast, ease: ease.exit };

/* ───────────── Direction ───────────── */

export type Dir = "ltr" | "rtl";
const DirContext = createContext<Dir>("ltr");

/** 1 in LTR, -1 in RTL. Multiply every horizontal distance by it. */
export function useDirSign(): 1 | -1 {
  return useContext(DirContext) === "rtl" ? -1 : 1;
}

export function useDir(): Dir {
  return useContext(DirContext);
}

/**
 * Root provider: direction for motion + reduced-motion policy.
 * reducedMotion="user" disables transform/layout animations for users who ask
 * for reduced motion, while keeping opacity/color transitions.
 */
export function MotionRoot({ dir = "ltr", children }: { dir?: Dir; children: ReactNode }) {
  return createElement(
    DirContext.Provider,
    { value: dir },
    createElement(MotionConfig, { reducedMotion: "user", transition: spring.snappy }, children),
  );
}

/* ───────────── Variants ───────────── */

/** Fade + small rise. Product: distance 8. Showcase: 16–32. */
export function fadeRise(distance = 8): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: { opacity: 1, y: 0, transition: spring.smooth },
    exit: { opacity: 0, y: distance / 2, transition: exitTransition },
  };
}

/**
 * Slide in along the inline axis, from the start edge (sign from useDirSign()).
 * Pass `from: "end"` for elements anchored to the end edge (e.g. an end-side drawer).
 */
export function slideInline(sign: 1 | -1, { distance = 16, from = "start" as "start" | "end" } = {}): Variants {
  const offset = distance * sign * (from === "start" ? -1 : 1);
  return {
    hidden: { opacity: 0, x: offset },
    visible: { opacity: 1, x: 0, transition: spring.smooth },
    exit: { opacity: 0, x: offset / 2, transition: exitTransition },
  };
}

/** Full-panel slide for drawers/sheets anchored to an inline edge. */
export function drawer(sign: 1 | -1, edge: "start" | "end" = "end"): Variants {
  const off = `${100 * sign * (edge === "start" ? -1 : 1)}%`;
  return {
    hidden: { x: off },
    visible: { x: 0, transition: spring.smooth },
    exit: { x: off, transition: { duration: duration.base, ease: ease.exit } },
  };
}

/** Scale-in from the trigger for popovers/menus (set transform-origin to the trigger side). */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: spring.snappy },
  exit: { opacity: 0, scale: 0.98, transition: exitTransition },
};

/** Parent that staggers its children. Keep total stagger ≤ 300ms in product UI. */
export function stagger(each = 0.035, delay = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: each, delayChildren: delay } },
    exit: { transition: { staggerChildren: each / 2, staggerDirection: -1 } },
  };
}

/** Press feedback for buttons/cards: <motion.button {...press} /> */
export const press = {
  whileTap: { scale: 0.97 },
  transition: spring.snappy,
} as const;

/* ───────────── Mode presets ───────────── */

/** Product vs showcase intensity from one place. */
export const modes = {
  product: { distance: 8, stagger: 0.025, enter: spring.snappy },
  showcase: { distance: 24, stagger: 0.06, enter: spring.smooth },
} as const;
