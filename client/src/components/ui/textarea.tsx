/* File Overview
  Path: client/src/components/ui/textarea.tsx
  Purpose: Reusable UI primitives (largely Shadcn + Radix wrappers) with Tailwind styling.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
