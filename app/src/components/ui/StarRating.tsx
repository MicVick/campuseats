"use client";

import { useState } from "react";
import { cn } from "@/utils/format";

/** Display-only star rating. */
export function Stars({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex", className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden
          style={{ fontSize: size }}
          className={i <= Math.round(value) ? "text-amber-400" : "text-line"}
        >
          ★
        </span>
      ))}
    </span>
  );
}

/** Interactive star input. */
export function StarInput({
  value,
  onChange,
  size = 36,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  label?: string;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex flex-col items-center gap-1">
      <div role="radiogroup" aria-label={label || "Rating"} className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(i)}
            className="transition-transform active:scale-90"
            style={{ fontSize: size, lineHeight: 1 }}
          >
            <span className={i <= shown ? "text-amber-400" : "text-line"}>★</span>
          </button>
        ))}
      </div>
    </div>
  );
}
