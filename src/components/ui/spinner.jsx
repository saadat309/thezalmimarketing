import { Loader2Icon } from "lucide-react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin",
  {
    variants: {
      size: {
        default: "size-8",
        sm: "size-4",
        lg: "size-12",
        icon: "size-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);


function Spinner({
  className,
  size,
  ...props
}) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size }), className)}
      {...props} />
  );
}

export { Spinner }
