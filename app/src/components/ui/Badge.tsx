"use client";

import { cn } from "@/utils/format";

/** Veg/non-veg indicator — the bordered square dot used in Indian food apps.
 *  Always pairs with a text label elsewhere for accessibility (not color-only). */
export function VegDot({
  isVeg,
  size = 14,
  className,
}: {
  isVeg: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={isVeg ? "Vegetarian" : "Non-vegetarian"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center border-[1.5px] rounded-[3px]",
        isVeg ? "border-veg" : "border-nonveg",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span
        className={cn("rounded-full", isVeg ? "bg-veg" : "bg-nonveg")}
        style={{ width: size * 0.5, height: size * 0.5 }}
      />
    </span>
  );
}

export function VegLabel({ isVeg }: { isVeg: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <VegDot isVeg={isVeg} />
      <span
        className={cn(
          "text-xs font-semibold",
          isVeg ? "text-veg" : "text-nonveg"
        )}
      >
        {isVeg ? "Veg" : "Non-veg"}
      </span>
    </span>
  );
}

export function OpenBadge({
  isOpen,
  nextOpenTime,
}: {
  isOpen: boolean;
  nextOpenTime?: string | null;
}) {
  if (isOpen) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-veg-soft px-2.5 py-1 text-xs font-semibold text-veg">
        <span className="h-1.5 w-1.5 rounded-full bg-veg" />
        Open now
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-muted px-2.5 py-1 text-xs font-semibold text-ink-soft">
      <span className="h-1.5 w-1.5 rounded-full bg-ink-faint" />
      {nextOpenTime ? `Opens ${nextOpenTime}` : "Closed"}
    </span>
  );
}

/** Star rating from user reviews, shown as "4.3 ★ (87)". */
export function RatingBadge({
  rating,
  count,
}: {
  rating: number;
  count?: number;
}) {
  if (!rating) {
    return <span className="text-xs font-medium text-ink-faint">New</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-veg px-1.5 py-0.5 text-xs font-bold text-white">
      {rating.toFixed(1)}
      <span aria-hidden>★</span>
      {count !== undefined && (
        <span className="ml-0.5 font-medium opacity-90">({count})</span>
      )}
    </span>
  );
}

/** MVRC committee rating — distinct blue badge for transparency. */
export function MvrcBadge({ rating }: { rating: number | null }) {
  if (rating == null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-surface-muted px-1.5 py-0.5 text-xs font-semibold text-ink-faint">
        MVRC: Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-mvrc-soft px-1.5 py-0.5 text-xs font-bold text-mvrc">
      MVRC {rating.toFixed(1)}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const tones = {
    neutral: "bg-surface-muted text-ink-soft",
    accent: "bg-accent-50 text-accent-700",
    success: "bg-veg-soft text-veg",
    warning: "bg-amber-50 text-warning",
    danger: "bg-nonveg-soft text-danger",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Order status badge with appropriate color coding. */
export function StatusBadge({ status }: { status: string }) {
  const toneMap: Record<string, "success" | "warning" | "danger" | "accent" | "neutral"> = {
    placed: "accent",
    accepted: "accent",
    preparing: "warning",
    ready_for_pickup: "success",
    completed: "success",
    cancelled: "danger",
    rejected: "danger",
  };
  const labelMap: Record<string, string> = {
    placed: "Placed",
    accepted: "Accepted",
    preparing: "Preparing",
    ready_for_pickup: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",
    rejected: "Rejected",
  };
  return (
    <Badge tone={toneMap[status] || "neutral"}>
      {labelMap[status] || status}
    </Badge>
  );
}

