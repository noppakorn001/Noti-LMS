import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "tesla-transition h-11 w-full rounded border border-[#D0D1D2] bg-transparent px-3 text-sm text-[#171A20] outline-none placeholder:text-[#8E8E8E] focus:border-[#3E6AE1] dark:border-white/15 dark:text-white",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
