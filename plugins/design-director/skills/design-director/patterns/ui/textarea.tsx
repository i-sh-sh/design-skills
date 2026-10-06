import * as React from "react";

import { cn } from "@/lib/utils";

// See input.tsx: plaintext bidi instead of dir="auto".
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-28 w-full rounded-md border border-input bg-card px-3.5 py-2.5 text-base text-start shadow-xs [field-sizing:content] [unicode-bidi:plaintext] transition-[border-color,box-shadow] duration-(--duration-fast) ease-standard placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
