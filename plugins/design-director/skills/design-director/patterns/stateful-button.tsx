"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SubmitState = "idle" | "loading" | "done";

/**
 * Button that goes press → loading → success (a check that draws itself),
 * keeping its width so nothing on the screen moves.
 */
export function StatefulButton({
  state,
  doneLabel,
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button> & { state: SubmitState; doneLabel: string }) {
  const layer = "absolute inset-0 grid place-items-center transition-[opacity,translate] duration-(--duration-base) ease-enter";
  const hidden = "opacity-0 translate-y-[calc(8px*var(--motion-distance))]";
  return (
    <Button
      {...props}
      aria-busy={state === "loading" || undefined}
      aria-disabled={state !== "idle" || undefined}
      data-state={state}
      className={cn("relative overflow-hidden data-[state=done]:bg-success", className)}
    >
      <span className={cn("transition-[opacity,translate] duration-(--duration-base) ease-enter", state !== "idle" && "opacity-0 -translate-y-[calc(8px*var(--motion-distance))]")}>
        {children}
      </span>
      <span aria-hidden className={cn(layer, state !== "loading" && hidden)}>
        <span className="size-4.5 animate-spin rounded-full border-2 border-current border-e-transparent" />
      </span>
      <span className={cn(layer, "gap-2", state !== "done" && hidden)}>
        <svg aria-hidden width="20" height="20" viewBox="0 0 24 24" className="flex-none">
          <path
            pathLength={1}
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "[stroke-dasharray:1] transition-[stroke-dashoffset] duration-(--duration-slow) ease-standard",
              state === "done" ? "[stroke-dashoffset:0] delay-75" : "[stroke-dashoffset:1]",
            )}
          />
        </svg>
        <span className="sr-only">{doneLabel}</span>
      </span>
    </Button>
  );
}
