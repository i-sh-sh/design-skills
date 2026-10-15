import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// The type scale in globals.css (`text-h1`, `text-label`, …) is custom, so
// tailwind-merge must be told these are font sizes. Otherwise it reads them
// as colours and drops them next to `text-muted-foreground` and friends.
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["display", "h1", "h2", "h3", "lead", "label"] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hebrew count phrase. "1 תפקידים" is wrong (and reads badly in a screen
 * reader), so one gets its own phrase: count(1, "תפקיד פתוח אחד", "תפקידים פתוחים").
 */
export function count(n: number, one: string, many: string) {
  return n === 1 ? one : `${n} ${many}`;
}
