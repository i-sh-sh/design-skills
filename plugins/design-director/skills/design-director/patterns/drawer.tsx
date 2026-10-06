"use client";

import type { ReactNode } from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Drawer from the inline-end edge on wider screens, bottom sheet on phones.
 * Radix Dialog gives focus trap, Escape, scroll lock and labelling; the motion
 * is `overlay-motion` / `drawer-motion` from patterns.css (direction-aware via
 * --dir-sign, travel zeroed under reduced motion via --motion-distance).
 *
 *   <Drawer open={open} onOpenChange={setOpen} title="הצטרפות לפרויקט" description="…">
 *     <form>…</form>
 *   </Drawer>
 */
export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  closeLabel = "סגירה",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  closeLabel?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-motion fixed inset-0 z-40 bg-foreground/30" />
        <Dialog.Content
          // Without a description, tell Radix explicitly (avoids its a11y warning)
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(
            "drawer-motion fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col gap-5 overflow-y-auto rounded-t-2xl border-t bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lg focus-visible:outline-none",
            "sm:inset-x-auto sm:inset-y-0 sm:end-0 sm:max-h-none sm:w-[26rem] sm:rounded-none sm:border-s sm:border-t-0 sm:p-6",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Dialog.Title className="text-h3 font-semibold">{title}</Dialog.Title>
              {description && <Dialog.Description className="text-sm text-muted-foreground">{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={closeLabel} className="-me-2 -mt-2">
                <X aria-hidden />
              </Button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
