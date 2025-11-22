import * as React from "react"
import { cva } from "class-variance-authority";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow ",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground ",
        destructive:
          "border-transparent bg-destructive text-white shadow ",
        outline: "text-black border-black bg-white/20 backdrop-blur-sm",
        sale: "border-transparent bg-green-500 text-white shadow",
        rent: "border-transparent bg-orange-500 text-white shadow",
        featured: "border-transparent bg-yellow-500 text-black shadow",
        new: "border-transparent bg-blue-500 text-white shadow",
        hot: "border-transparent bg-red-500 text-white shadow",
        discounted: "border-transparent bg-purple-500 text-white shadow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  children,
  ...props
}) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === 'hot' && <Flame className="w-3 h-3 mr-1" />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants }
