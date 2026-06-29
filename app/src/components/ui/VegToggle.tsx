"use client";

import { usePrefsStore } from "@/stores/prefsStore";
import { VegDot } from "@/components/ui/Badge";
import { cn } from "@/utils/format";

/** The prominent, always-visible Veg-Only switch. Synced globally. */
export function VegToggle({ className }: { className?: string }) {
  const vegOnly = usePrefsStore((s) => s.vegOnly);
  const toggle = usePrefsStore((s) => s.toggleVegOnly);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={vegOnly}
      aria-label="Show vegetarian only"
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-sm font-semibold transition-colors",
        vegOnly
          ? "border-veg bg-veg-soft text-veg"
          : "border-line bg-white text-ink-soft",
        className
      )}
    >
      <VegDot isVeg size={15} />
      <span>Veg Only</span>
      <span
        className={cn(
          "relative ml-0.5 h-4 w-7 rounded-full transition-colors",
          vegOnly ? "bg-veg" : "bg-line"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-all",
            vegOnly ? "left-3.5" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}
