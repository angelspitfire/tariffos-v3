import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'ai';
}

const cardVariants = {
  default: "bg-zinc-900 border-zinc-800 shadow-xl",
  ai: "bg-[var(--surface)/0.5] border-[var(--brand-glow)] shadow-[0_0_20px_rgba(139,92,246,0.15)] backdrop-blur-md"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border p-6 transition-all duration-300",
          cardVariants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }
