import * as React from "react";

import { cn } from "@/lib/utils";

// Typed text may be Hebrew or English. `unicode-bidi: plaintext` takes each value's direction from
// its first strong character, while an empty field (placeholder, caret) keeps the page's RTL.
// Don't use dir="auto" here: on an empty field it resolves to LTR.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-md border border-input bg-card px-3.5 text-base text-start shadow-xs [unicode-bidi:plaintext] transition-[border-color,box-shadow] duration-(--duration-fast) ease-standard placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
