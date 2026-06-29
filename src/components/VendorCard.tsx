"use client";

import Link from "next/link";
import { FoodImage } from "@/components/FoodImage";
import { RatingBadge, MvrcBadge, OpenBadge, VegDot } from "@/components/ui/Badge";
import { cn } from "@/utils/format";
import type { VendorCardLike } from "@/types";

export function VendorCard({ vendor }: { vendor: VendorCardLike }) {
  const closed = vendor.isOpen === false;

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className={cn(
        "group block overflow-hidden rounded-card bg-surface shadow-sm ring-1 ring-line/60 transition-all hover:-translate-y-0.5 hover:shadow-md",
        closed && "opacity-75"
      )}
    >
      <div className="relative">
        <FoodImage
          src={vendor.imageUrl}
          alt={vendor.name}
          name={vendor.name}
          className="h-36 w-full transition-transform duration-300 group-hover:scale-[1.03]"
          emoji="🍴"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        {vendor.isOpen !== undefined && (
          <div className="absolute bottom-2.5 left-2.5">
            <OpenBadge isOpen={!!vendor.isOpen} nextOpenTime={vendor.nextOpenTime} />
          </div>
        )}
        {(vendor.hasVeg || vendor.hasNonVeg) && (
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-pill bg-white/90 px-1.5 py-1 shadow-sm backdrop-blur">
            {vendor.hasVeg && <VegDot isVeg size={12} />}
            {vendor.hasNonVeg && <VegDot isVeg={false} size={12} />}
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-bold text-ink">{vendor.name}</h3>
          {vendor.avgRating > 0 && (
            <RatingBadge rating={vendor.avgRating} count={vendor.ratingCount} />
          )}
        </div>

        <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
          {vendor.cuisineTags.join(" · ")}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <MvrcBadge rating={vendor.mvrcRating} />
          <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
            ⏱ {vendor.avgPrepTimeMins} min
          </span>
        </div>

        <p className="mt-2 line-clamp-1 border-t border-line pt-2 text-xs text-ink-faint">
          📍 {vendor.area}
        </p>
      </div>
    </Link>
  );
}
