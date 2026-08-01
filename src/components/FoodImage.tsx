"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { cn } from "@/utils/format";

const GRADIENTS = [
  "from-orange-200 to-amber-100",
  "from-rose-200 to-orange-100",
  "from-lime-200 to-emerald-100",
  "from-sky-200 to-indigo-100",
  "from-violet-200 to-fuchsia-100",
  "from-amber-200 to-yellow-100",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Image with a branded gradient + initial fallback when src is missing or fails. */
export function FoodImage({
  src,
  alt,
  name,
  className,
  emoji,
}: {
  src?: string | null;
  alt: string;
  name: string;
  className?: string;
  emoji?: string;
}) {
  const [failed, setFailed] = useState(false);
  const gradient = GRADIENTS[hash(name) % GRADIENTS.length];

  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gradient-to-br text-3xl font-black text-white/80",
          gradient,
          className
        )}
        aria-label={alt}
        role="img"
      >
        {emoji ?? name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn("object-cover", className)}
    />
  );
}
