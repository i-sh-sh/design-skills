import { ViewTransition, type ReactNode } from "react";

/**
 * Directional page transitions (Next 16 + React <ViewTransition>). Links tag
 * navigations with "nav-forward" / "nav-back"; the CSS in globals.css flips
 * the direction for RTL. Put this in each page, not in the layout.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const types = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };
  return (
    <ViewTransition enter={types} exit={types} default="none">
      {children}
    </ViewTransition>
  );
}
