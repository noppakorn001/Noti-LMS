import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-1 text-xs font-medium text-[#5C5E62] dark:text-[#D0D1D2]",
        className,
      )}
    >
      {children}
    </span>
  );
}
