"use client";

import { useCallback, useRef } from "react";

import { haptic, project, prefersReducedMotion, rubberband, spring, SPRING_SNAP, velocityTracker } from "@/lib/physics";

/**
 * Drag-to-dismiss for the bottom sheet, in the spirit of
 * iOS sheets: pull the grab zone (`data-sheet-grab`: the handle and title
 * row, `touch-action: none`) and the sheet follows the finger; pulling up
 * rubber-bands. The rest of the sheet keeps native scrolling. Let go past a
 * third of its height, or flick down, and it leaves with the flick's speed;
 * otherwise it springs back. Phones only (below the `sm` breakpoint) — on wider screens
 * the drawer comes from the side and closes with Escape or the X.
 *
 * Spread the returned handlers on Radix `Dialog.Content`.
 */
export function useSheetDrag(onDismiss: () => void, enabled = true) {
  const y = useRef(0);
  const g = useRef<{ id: number; sy: number; axis: "y" | null } | null>(null);
  const tracker = useRef(velocityTracker());
  const armed = useRef(false);
  const stopAnim = useRef<() => void>(() => {});

  const paint = (el: HTMLElement) => {
    el.style.translate = `0 ${y.current}px`;
    const h = el.offsetHeight || 1;
    // The backdrop clears as the sheet goes, so it feels like one object.
    const overlay = el.previousElementSibling as HTMLElement | null;
    if (overlay) overlay.style.opacity = String(1 - Math.max(0, Math.min(1, y.current / h)));
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!enabled || window.innerWidth >= 640 || e.button !== 0) return;
      if (!(e.target as HTMLElement).closest("[data-sheet-grab]")) return;
      stopAnim.current();
      g.current = { id: e.pointerId, sy: e.clientY - y.current, axis: null };
      tracker.current.reset();
      tracker.current.push(0, e.clientY);
    },
    [enabled],
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const s = g.current;
    if (!s || s.id !== e.pointerId) return;
    const el = e.currentTarget;
    const dy = e.clientY - s.sy;
    if (!s.axis) {
      if (Math.abs(dy) < 6) return;
      s.axis = "y";
      el.setPointerCapture(e.pointerId);
      el.dataset.dragging = "";
    }
    tracker.current.push(0, e.clientY);
    const h = el.offsetHeight;
    y.current = dy >= 0 ? dy : rubberband(dy, h, 0.4);
    const now = y.current > h / 3;
    if (now !== armed.current) {
      if (now) haptic(6);
      armed.current = now;
    }
    paint(el);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const s = g.current;
      g.current = null;
      if (!s || s.axis !== "y") return;
      const el = e.currentTarget;
      delete el.dataset.dragging;
      const { vy } = tracker.current.get();
      const h = el.offsetHeight;
      const landing = y.current + project(vy, 0.99);
      if (landing > h / 3) {
        // Leave along the flick, then close without Radix's own exit animation.
        el.dataset.draggedOut = "";
        if (prefersReducedMotion()) {
          onDismiss();
          return;
        }
        const run = spring(y.current, h + 40, Math.max(vy, 1200), (ny) => {
          y.current = ny;
          paint(el);
        }, { stiffness: 180, damping: 26 });
        stopAnim.current = run.stop;
        setTimeout(() => {
          run.stop();
          onDismiss();
        }, 200);
      } else {
        const run = spring(y.current, 0, vy, (ny) => {
          y.current = ny;
          paint(el);
        }, SPRING_SNAP);
        stopAnim.current = run.stop;
      }
      armed.current = false;
    },
    [onDismiss],
  );

  /** A drag must not toggle the radio card the finger started on. */
  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (Math.abs(y.current) > 4) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClickCapture };
}
