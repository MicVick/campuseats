"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import {
  useFavouriteIds,
  useToggleFavourite,
} from "@/hooks/useFavourites";
import { FoodImage } from "@/components/FoodImage";
import { RatingBadge, MvrcBadge, OpenBadge, VegDot } from "@/components/ui/Badge";
import { useToast } from "@/components/Toast";
import { cn } from "@/utils/format";
import type { VendorCardLike } from "@/types";

export function VendorCard({ vendor }: { vendor: VendorCardLike }) {
  const token = useAuthStore((s) => s.token);
  const favIds = useFavouriteIds();
  const toggleFav = useToggleFavourite();
  const toast = useToast();
  const isFav = favIds.has(vendor.id);
  const closed = vendor.isOpen === false;

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      toast.info("Log in to save favourites");
      return;
    }
    toggleFav.mutate(
      { vendorId: vendor.id, isFav },
      {
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : "Couldn't update"),
      }
    );
  };

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className={cn(
        "group block overflow-hidden rounded-card bg-surface shadow-sm transition-shadow hover:shadow-md",
        closed && "opacity-70"
      )}
    >
      <div className="relative">
        <FoodImage
          src={vendor.imageUrl}
          alt={vendor.name}
          name={vendor.name}
          className="h-36 w-full"
          emoji="🍴"
        />
        <button
          onClick={onFav}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          aria-pressed={isFav}
          className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur transition-transform active:scale-90"
        >
          <span className={isFav ? "text-accent-500" : "text-ink-faint"}>
            {isFav ? "♥" : "♡"}
          </span>
        </button>
        {vendor.isOpen !== undefined && (
          <div className="absolute bottom-2.5 left-2.5">
            <OpenBadge isOpen={!!vendor.isOpen} nextOpenTime={vendor.nextOpenTime} />
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

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <MvrcBadge rating={vendor.mvrcRating} />
          <span className="text-xs text-ink-faint">
            {vendor.avgPrepTimeMins} min
          </span>
          {(vendor.hasVeg || vendor.hasNonVeg) && (
            <span className="flex items-center gap-1">
              {vendor.hasVeg && <VegDot isVeg size={12} />}
              {vendor.hasNonVeg && <VegDot isVeg={false} size={12} />}
            </span>
          )}
        </div>

        <p className="mt-1.5 line-clamp-1 text-xs text-ink-faint">
          📍 {vendor.area}
        </p>
      </div>
    </Link>
  );
}
