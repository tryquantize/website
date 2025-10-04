/* File Overview
  Path: client/src/components/ui/button.tsx
  Purpose: Reusable UI primitives (largely Shadcn + Radix wrappers) with Tailwind styling.

  Reading tip for newcomers:
  - Scan the exports at the bottom to see what the rest of the app imports from here
  - Follow the data flow via function parameters and return values
*/

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { GlowingBorder } from "@/components/ui/glowing-border"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  glowing?: boolean
  glowColor?: string
  glowIntensity?: 'low' | 'medium' | 'high'
  interactive?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, glowing = false, glowColor, glowIntensity = 'medium', interactive = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    if (interactive && !asChild) {
      const interactiveButton = (
        <button
          ref={ref}
          className={cn(
            buttonVariants({ variant, size }),
            "group relative overflow-hidden",
            className
          )}
          {...props}
        >
          <span className="inline-block transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-0">
            {children}
          </span>
          <div className="absolute top-0 z-10 flex h-full w-full translate-x-8 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
            <span>{children}</span>
            <ArrowRight className="h-4 w-4" />
          </div>
          <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8] group-hover:bg-primary"></div>
        </button>
      )
      
      if (glowing) {
        return (
          <GlowingBorder glowColor={glowColor} intensity={glowIntensity}>
            {interactiveButton}
          </GlowingBorder>
        )
      }
      
      return interactiveButton
    }
    
    const buttonElement = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }), glowing && "relative z-10")}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
    
    if (glowing) {
      return (
        <GlowingBorder glowColor={glowColor} intensity={glowIntensity}>
          {buttonElement}
        </GlowingBorder>
      )
    }
    
    return buttonElement
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
