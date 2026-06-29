"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearch } from "@/hooks/useSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { usePrefsStore } from "@/stores/prefsStore";
import { VendorCard } from "@/components/VendorCard";
import { VegToggle } from "@/components/ui/VegToggle";
import { VegDot } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/utils/format";

const RECENT_KEY = "campuseats-recent-searches";

export default function SearchPage() {
  const vegOnly = usePrefsStore((s) => s.vegOnly);
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 350);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  const { data, isLoading, isFetching } = useSearch(debounced, vegOnly);

  const commitRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const updated = [t, ...recent.filter((r) => r !== t)].slice(0, 6);
    setRecent(updated);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  };

  const hasQuery = debounced.trim().length > 0;
  const noResults =
    hasQuery &&
    !isLoading &&
    data &&
    data.vendors.length === 0 &&
    data.dishes.length === 0;

  return (
    <div>
      <header className="sticky top-0 z-20 space-y-3 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
        <h1 className="text-xl font-black text-ink">Search</h1>
        <div className="flex items-center gap-2">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-line bg-white px-3">
            <span className="text-ink-faint">🔍</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => commitRecent(query)}
              placeholder="Maggi, rolls, dosa, vendor name…"
              className="h-full flex-1 bg-transparent text-sm text-ink outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="text-ink-faint"
              >
                ✕
              </button>
            )}
          </div>
          <VegToggle />
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Empty state: show recent + hint */}
        {!hasQuery && (
          <div className="space-y-6">
            {recent.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-bold text-ink-soft">Recent</h2>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => setQuery(r)}
                      className="rounded-pill border border-line bg-white px-3 py-1.5 text-sm text-ink-soft"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}
            <EmptyState
              icon="🔎"
              title="Find your craving"
              message="Search across vendors and dishes. Tap a dish to jump straight to it."
            />
          </div>
        )}

        {hasQuery && (isLoading || isFetching) && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        )}

        {noResults && (
          <EmptyState
            icon="🤔"
            title={`No results for "${debounced}"`}
            message="Try a different spelling, or clear the Veg Only filter."
          />
        )}

        {hasQuery && data && !isLoading && (
          <div className="space-y-6">
            {data.vendors.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold text-ink-soft">
                  Vendors ({data.vendors.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {data.vendors.map((v) => (
                    <VendorCard key={v.id} vendor={v} />
                  ))}
                </div>
              </section>
            )}

            {data.dishes.length > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-bold text-ink-soft">
                  Dishes ({data.dishes.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.dishes.map((d) => (
                    <Link
                      key={d.id}
                      href={`/vendors/${d.vendorId}?item=${d.id}`}
                      className="flex items-start gap-3 rounded-card border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow active:scale-[0.99]"
                    >
                      <VegDot isVeg={d.isVeg} className="mt-1" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ink">{d.name}</p>
                        <p className="line-clamp-2 mt-0.5 text-xs text-ink-faint">
                          {d.vendorName}
                          {d.description ? ` · ${d.description}` : ""}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-ink">
                        {formatPrice(d.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
