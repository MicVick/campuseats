"use client";

import { cn } from "@/utils/format";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function VendorCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card bg-surface shadow-sm">
      <Skeleton className="h-36 w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-14 rounded-pill" />
          <Skeleton className="h-5 w-16 rounded-pill" />
        </div>
      </div>
    </div>
  );
}

export function VendorListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <VendorCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="flex items-start justify-between gap-3 py-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-52" />
      </div>
      <Skeleton className="h-20 w-24 rounded-xl" />
    </div>
  );
}
