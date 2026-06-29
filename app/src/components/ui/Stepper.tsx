"use client";

import { cn } from "@/utils/format";

/** Quantity stepper (− qty +). Compact variant used on menu item cards. */
export function Stepper({
  value,
  onInc,
  onDec,
  min = 1,
  size = "md",
  className,
}: {
  value: number;
  onInc: () => void;
  onDec: () => void;
  min?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const dims = size === "sm" ? "h-8 text-sm" : "h-10 text-base";
  const btn = size === "sm" ? "w-8" : "w-10";
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl border border-accent-200 bg-accent-50 font-bold text-accent-600",
        dims,
        className
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onDec}
        disabled={value <= min}
        className={cn(
          "flex h-full items-center justify-center disabled:opacity-40",
          btn
        )}
      >
        −
      </button>
      <span className="min-w-[1.5rem] text-center tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={onInc}
        className={cn("flex h-full items-center justify-center", btn)}
      >
        +
      </button>
    </div>
  );
}
