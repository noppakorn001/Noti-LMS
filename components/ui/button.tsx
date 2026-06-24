import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "tesla-transition inline-flex min-h-10 items-center justify-center rounded px-4 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#3E6AE1] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#3E6AE1] text-white hover:bg-[#345cc7]",
        secondary: "bg-white text-[#393C41] hover:bg-[#F4F4F4] dark:bg-white dark:text-[#171A20]",
        ghost: "bg-transparent text-[#5C5E62] hover:bg-[#F4F4F4] hover:text-[#171A20] dark:text-[#D0D1D2] dark:hover:bg-white/10 dark:hover:text-white",
        danger: "bg-transparent text-[#5C5E62] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10",
      },
      size: {
        sm: "min-h-8 px-3 text-sm",
        md: "min-h-10 px-4",
        lg: "min-h-11 px-6",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
);

Button.displayName = "Button";
