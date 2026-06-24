import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg bg-[#F4F4F4] p-4 text-[#171A20] dark:bg-white/5 dark:text-white", className)}
      {...props}
    />
  );
}
