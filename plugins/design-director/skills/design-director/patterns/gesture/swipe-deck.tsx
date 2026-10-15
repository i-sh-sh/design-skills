"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Heart, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { haptic, project as projectFlick, rubberband, spring, SPRING_SNAP, useReducedMotion, velocityTracker } from "@/lib/physics";
import { cn } from "@/lib/utils";

type Verdict = "keep" | "skip";

export type DeckLabels = {
  region: string; // aria-label of the deck
  keepStamp: string; // stamp shown while dragging right
  skipStamp: string; // stamp shown while dragging left
  keepButton: string; // aria-label, mention the key: "Keep (right arrow)"
  skipButton: string;
  undoButton: string;
  kept: string; // announced after a keep
  skipped: string; // announced after a skip
  backTo: (title: string) => string; // announced after undo
  hintPointer: string; // under the deck, mouse/pen
  hintTouch: string; // under the deck, touch
  keptCount: (n: number) => string; // e.g. count(n, "one saved", "saved") from utils
};

export type SwipeDeckProps<T extends { id: string; title: string }> = {
  items: T[];
  /** The card face. Return an <article>; give it `relative overflow-hidden` and a min height. */
  renderCard: (item: T, position: number, total: number) => ReactNode;
  /** Shown when the pile is empty: what was kept, and a way to start again. */
  renderDone: (kept: T[], restart: () => void) => ReactNode;
  labels: DeckLabels;
};

/**
 * Swipe deck (extracted from MoshLab, owner-loved 2026-10): sort a list with
 * your thumb. Fling right to keep, left to skip. The card carries the
 * finger's velocity, tilts around the point you grabbed, rubber-bands
 * vertically, and the next card rises as this one leaves. Physical left/right
 * on purpose, in both directions: it is a hand gesture, not reading order.
 *
 * Every gesture has a button and a key (← →, Backspace to undo), and the
 * verdict is announced. Reduced motion: the card still follows the finger
 * (the user moves it), but leaves and returns by fading, without flying.
 * Styles: the `.deck*` rules in gesture.css.
 */
export function SwipeDeck<T extends { id: string; title: string }>({ items: projects, renderCard, renderDone, labels }: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState<{ id: string; verdict: Verdict }[]>([]);
  const [announce, setAnnounce] = useState("");
  const reduced = useReducedMotion();

  const top = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const y = useRef(0);
  const grabY = useRef(0.5); // where on the card the finger landed, 0 top … 1 bottom
  const anim = useRef<{ stop: () => void } | null>(null);
  const drag = useRef<{ id: number; sx: number; sy: number; moved: boolean; axis: "x" | "y" | null } | null>(null);
  const tracker = useRef(velocityTracker());
  const armed = useRef<Verdict | null>(null);
  const busy = useRef(false);
  const enterFrom = useRef(0);

  const kept = history.filter((h) => h.verdict === "keep").map((h) => projects.find((p) => p.id === h.id)).filter(Boolean) as T[];
  const current = projects[index];

  /** Write the drag state to the DOM; no React render per frame. */
  const paint = useCallback(() => {
    const el = top.current;
    if (!el) return;
    const w = el.offsetWidth || 1;
    const p = Math.max(-1, Math.min(1, x.current / (w * 0.4)));
    // Grab the bottom half and the card swings the other way, like paper.
    const tilt = (x.current / w) * 14 * (grabY.current > 0.5 ? -1 : 1);
    el.style.translate = `${x.current}px ${y.current}px`;
    el.style.rotate = reduced ? "0deg" : `${tilt}deg`;
    el.style.setProperty("--keep", String(Math.max(0, p)));
    el.style.setProperty("--skip", String(Math.max(0, -p)));
    el.parentElement?.style.setProperty("--lift", String(Math.abs(p)));
  }, [reduced]);

  const reset = useCallback(() => {
    x.current = 0;
    y.current = 0;
    armed.current = null;
    paint();
    const el = top.current;
    if (el) el.style.opacity = "";
  }, [paint]);

  // New top card: start centred, or fly back in from the side it left by (undo).
  useEffect(() => {
    reset();
    busy.current = false;
    const side = enterFrom.current;
    enterFrom.current = 0;
    const el = top.current;
    if (!side || !el || reduced) return;
    const from = side * (window.innerWidth / 2 + el.offsetWidth);
    x.current = from;
    paint();
    anim.current = spring(from, 0, 0, (nx) => {
      x.current = nx;
      paint();
    }, { stiffness: 220, damping: 26 });
  }, [index, reset, paint, reduced]);

  /** Not far enough: spring home, carrying the release velocity. */
  const settle = (vx: number) => {
    const fy = y.current;
    const fx = x.current || 1;
    anim.current = spring(x.current, 0, vx, (nx) => {
      x.current = nx;
      y.current = fy * (nx / fx);
      paint();
    }, SPRING_SNAP);
  };

  const commit = useCallback(
    async (verdict: Verdict, vx = 0) => {
      const el = top.current;
      if (!el || busy.current || !current) return;
      busy.current = true;
      anim.current?.stop();
      const w = el.offsetWidth;
      const dir = verdict === "keep" ? 1 : -1;
      haptic(verdict === "keep" ? 12 : 6);
      if (reduced) {
        el.style.transition = "opacity 160ms ease-out";
        el.style.opacity = "0";
        await new Promise((r) => setTimeout(r, 170));
        el.style.transition = "";
      } else {
        // Leave at least as fast as the flick, along its line.
        const target = dir * (window.innerWidth / 2 + w);
        const v = Math.abs(vx) > 400 ? vx : dir * 1600;
        const fromX = x.current;
        const fromY = y.current;
        const run = spring(fromX, target, v, (nx) => {
          const t = (nx - fromX) / (target - fromX || 1);
          x.current = nx;
          y.current = fromY + t * 40;
          paint();
        }, { stiffness: 120, damping: 18 });
        anim.current = run;
        // Don't wait for the spring to settle off-screen.
        await Promise.race([run.done, new Promise((r) => setTimeout(r, 260))]);
        run.stop();
      }
      setHistory((h) => [...h, { id: current.id, verdict }]);
      setAnnounce(`${current.title}: ${verdict === "keep" ? labels.kept : labels.skipped}`);
      setIndex((i) => i + 1);
    },
    [current, paint, reduced, labels],
  );

  const undo = useCallback(() => {
    const last = history[history.length - 1];
    if (!last || busy.current) return;
    busy.current = true;
    enterFrom.current = last.verdict === "keep" ? 1 : -1;
    setHistory((h) => h.slice(0, -1));
    setIndex((i) => i - 1);
    setAnnounce(labels.backTo(projects.find((p) => p.id === last.id)?.title ?? ""));
  }, [history, projects, labels]);

  // ───────── Pointer gesture ─────────
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (busy.current || e.button !== 0) return;
    anim.current?.stop(); // catch the card mid-flight
    const r = e.currentTarget.getBoundingClientRect();
    grabY.current = (e.clientY - r.top) / r.height;
    drag.current = { id: e.pointerId, sx: e.clientX - x.current, sy: e.clientY - y.current, moved: false, axis: null };
    tracker.current.reset();
    tracker.current.push(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    // Decide the axis once: vertical drags belong to page scroll.
    if (!d.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.axis === "y") {
        drag.current = null;
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    d.moved = true;
    tracker.current.push(e.clientX, e.clientY);
    const w = e.currentTarget.offsetWidth;
    // Free in x; vertical travel is resisted so the card stays on its rail.
    x.current = dx;
    y.current = rubberband(dy, w, 0.25);
    const now: Verdict | null = dx > w * 0.32 ? "keep" : dx < -w * 0.32 ? "skip" : null;
    if (now !== armed.current) {
      if (now) haptic(6);
      armed.current = now;
    }
    paint();
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) return;
    const { vx } = tracker.current.get();
    const w = e.currentTarget.offsetWidth;
    // Momentum projection: a short fast flick counts like a long drag.
    const landing = x.current + projectFlick(vx, 0.99);
    if (landing > w * 0.6) void commit("keep", vx);
    else if (landing < -w * 0.6) void commit("skip", vx);
    else settle(vx);
  };

  // A drag must not open the link underneath it.
  const onClickCapture = (e: React.MouseEvent) => {
    if (Math.abs(x.current) > 4) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === "ArrowRight") { e.preventDefault(); void commit("keep"); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); void commit("skip"); }
    else if (e.key === "Backspace") { e.preventDefault(); undo(); }
  };

  if (projects.length === 0) return null;

  return (
    <section aria-label={labels.region} onKeyDown={onKeyDown} className="flex flex-col items-center gap-5">
      <p className="sr-only" aria-live="polite">{announce}</p>

      <div className={cn("deck relative grid w-full max-w-md place-items-stretch", index === 0 && history.length === 0 && "deck-hint")} style={{ "--lift": 0 } as React.CSSProperties}>
        {current ? (
          projects.slice(index, index + 3).map((p, depth) => (
            <div
              key={p.id}
              ref={depth === 0 ? top : undefined}
              aria-hidden={depth > 0}
              inert={depth > 0}
              className={cn("deck-card relative col-start-1 row-start-1", depth === 0 && "deck-top")}
              style={{ "--depth": depth, zIndex: 3 - depth } as React.CSSProperties}
              {...(depth === 0 && {
                onPointerDown,
                onPointerMove,
                onPointerUp,
                onPointerCancel: onPointerUp,
                onClickCapture,
              })}
            >
              {/* Verdict stamps fade in with the drag (--keep / --skip, 0…1) */}
              <span aria-hidden className="deck-stamp deck-stamp-keep">{labels.keepStamp}</span>
              <span aria-hidden className="deck-stamp deck-stamp-skip">{labels.skipStamp}</span>
              {renderCard(p, index + depth + 1, projects.length)}
            </div>
          ))
        ) : (
          <div className="deck-done col-start-1 row-start-1">{renderDone(kept, () => { setHistory([]); setIndex(0); })}</div>
        )}
      </div>

      {current && (
        // Physical layout on purpose: skip sits left, keep sits right, like the gesture.
        <div dir="ltr" className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" className="deck-btn size-14" aria-label={labels.skipButton} onClick={() => void commit("skip")}>
            <X aria-hidden className="size-6!" />
          </Button>
          <Button variant="ghost" size="icon" aria-label={labels.undoButton} disabled={history.length === 0} onClick={undo}>
            <RotateCcw aria-hidden />
          </Button>
          <Button variant="accent" size="icon" className="deck-btn size-14" aria-label={labels.keepButton} onClick={() => void commit("keep")}>
            <Heart aria-hidden className="size-6!" />
          </Button>
        </div>
      )}

      {current && (
        <p className="text-center text-sm text-muted-foreground" data-numeric>
          {kept.length > 0 ? `${labels.keptCount(kept.length)} · ` : ""}
          <span className="pointer-coarse:hidden">{labels.hintPointer}</span>
          <span className="pointer-fine:hidden">{labels.hintTouch}</span>
        </p>
      )}
    </section>
  );
}
