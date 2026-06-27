import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 text-[#171A20] dark:bg-[#1E2026] dark:text-white border border-gray-100 dark:border-white/5 transition-all duration-300",
        className
      )}
      {...props}
    />
  );
}
