"use client";

import { useState } from "react";
import Link from "next/link";
import { useVendors } from "@/hooks/useVendors";
import { usePrefsStore } from "@/stores/prefsStore";
import { useAuthStore } from "@/stores/authStore";
import { VendorCard } from "@/components/VendorCard";
import { VegToggle } from "@/components/ui/VegToggle";
import { VendorListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { cn } from "@/utils/format";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Late Night", value: "Late Night" },
  { label: "Chai & Snacks", value: "Chai" },
  { label: "Rolls & Wraps", value: "Rolls" },
  { label: "Beverages", value: "Beverages" },
  { label: "South Indian", value: "South Indian" },
  { label: "Fast Food", value: "Fast Food" },
];

export default function HomePage() {
  const vegOnly = usePrefsStore((s) => s.vegOnly);
  const user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState("");

  const { data, isLoading, isError, refetch } = useVendors({
    veg: vegOnly,
    category: category || undefined,
  });

  const openVendors = data?.filter((v) => v.isOpen) ?? [];
  const closedVendors = data?.filter((v) => !v.isOpen) ?? [];

  return (
    <div>
      {/* Sticky top bar with veg toggle */}
      <header className="sticky top-0 z-20 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-faint">
              {user ? `Hi, ${user.name.split(" ")[0]} 👋` : "IIMA Campus"}
            </p>
            <h1 className="text-xl font-black text-ink">What's cooking?</h1>
          </div>
          {!user && (
            <Link
              href="/login"
              className="rounded-pill bg-accent-500 px-4 py-2 text-sm font-semibold text-white"
            >
              Log in
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm text-ink-faint"
          >
            🔍 Search dishes, vendors…
          </Link>
          <VegToggle />
        </div>
      </header>

      {/* Category rail */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {CATEGORIES.map((c) => (
          <button
            key={c.label}
            onClick={() => setCategory(c.value)}
            className={cn(
              "shrink-0 rounded-pill border px-3.5 py-1.5 text-sm font-semibold transition-colors",
              category === c.value
                ? "border-accent-500 bg-accent-500 text-white"
                : "border-line bg-white text-ink-soft"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <main className="px-4 pb-6">
        {isLoading && <VendorListSkeleton />}

        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && data && (
          <>
            {data.length === 0 && (
              <EmptyState
                icon={vegOnly ? "🥗" : "🍽️"}
                title={vegOnly ? "No veg vendors here" : "No vendors found"}
                message={
                  vegOnly
                    ? "Try turning off the Veg Only filter or pick another category."
                    : "Try a different category."
                }
                action={
                  (vegOnly || category) && (
                    <button
                      onClick={() => setCategory("")}
                      className="text-sm font-semibold text-accent-600"
                    >
                      Clear filters
                    </button>
                  )
                }
              />
            )}

            {openVendors.length > 0 && (
              <section>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {openVendors.map((v) => (
                    <VendorCard key={v.id} vendor={v} />
                  ))}
                </div>
              </section>
            )}

            {closedVendors.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-sm font-bold text-ink-soft">
                  Currently closed
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {closedVendors.map((v) => (
                    <VendorCard key={v.id} vendor={v} />
                  ))}
                </div>
              </section>
            )}

            {data.length > 0 && openVendors.length === 0 && (
              <p className="mt-6 text-center text-sm text-ink-faint">
                All vendors are closed right now — check back soon!
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
