"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";

type Toast = { id: number; message: string; leaving?: boolean };
const ToastContext = createContext<(message: string) => void>(() => {});

const VISIBLE_MS = 3200;
const EXIT_MS = 200;

/**
 * Toasts: enter with the CSS spring (`toast-motion` in patterns.css), leave faster.
 * Appear at the inline-end edge (left in RTL). `bottom-24` on phones clears a
 * bottom navigation bar; use `bottom-4` if the app has none.
 */
export function Toaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const next = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), EXIT_MS);
  }, []);

  const toast = useCallback(
    (message: string) => {
      const id = ++next.current;
      setToasts((ts) => [...ts.slice(-2), { id, message }]);
      setTimeout(() => dismiss(id), VISIBLE_MS);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-24 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:end-6 sm:bottom-6 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            data-leaving={t.leaving ? "" : undefined}
            className="toast-motion pointer-events-auto flex min-h-11 w-full max-w-sm items-center gap-2.5 rounded-lg bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-lg sm:w-auto"
          >
            <Check aria-hidden className="size-4 shrink-0" />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
