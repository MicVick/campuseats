"use client";

import Link from "next/link";
import { RequireAuth } from "@/components/student/RequireAuth";
import { useFavourites } from "@/hooks/useFavourites";
import { VendorCard } from "@/components/VendorCard";
import { VendorListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { ChevronLeftIcon } from "@/components/icons";

function FavouritesInner() {
  const { data, isLoading, isError, refetch } = useFavourites();

  return (
    <div>
      <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
        <Link
          href="/profile"
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-black text-ink">Favourites</h1>
      </header>

      <main className="px-4 py-4">
        {isLoading && <VendorListSkeleton count={4} />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {!isLoading && !isError && data && data.length === 0 && (
          <EmptyState
            icon="💔"
            title="No favourites yet"
            message="Tap the heart on any vendor to save it here."
            action={
              <Link
                href="/"
                className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Explore vendors
              </Link>
            }
          />
        )}
        {data && data.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function FavouritesPage() {
  return (
    <RequireAuth>
      <FavouritesInner />
    </RequireAuth>
  );
}
