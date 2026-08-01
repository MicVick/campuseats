"use client";

import { useVendorDashboard, useVendorPopularItems } from "@/hooks/useVendorApi";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatPrice } from "@/utils/format";

export default function VendorDashboardPage() {
  const { data: summary, isLoading } = useVendorDashboard();
  const { data: popular } = useVendorPopularItems();

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-black text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Today&apos;s overview</p>

      {/* Stats grid */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : summary ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total Orders" value={summary.totalOrders} emoji="📦" />
          <StatCard label="New" value={summary.placed} emoji="🔔" accent />
          <StatCard label="In Progress" value={summary.accepted} emoji="🍳" />
          <StatCard label="Ready" value={summary.readyForPickup} emoji="✅" />
          <StatCard label="Completed" value={summary.completed} emoji="🎉" />
          <StatCard label="Revenue" value={formatPrice(summary.totalRevenue)} emoji="💰" />
        </div>
      ) : null}

      {/* Popular items */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-ink">Popular Items</h2>
        <p className="mt-0.5 text-xs text-ink-soft">This week</p>

        {popular && popular.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-4">
            {popular.map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-50 text-sm font-bold text-accent-600">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-ink">{item.name}</span>
                <span className="text-sm text-ink-faint">{item.orderCount} orders</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-faint">No order data yet this week.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  emoji,
  accent,
}: {
  label: string;
  value: string | number;
  emoji: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 shadow-sm ${accent ? "bg-accent-50 border border-accent-200" : "bg-surface"}`}>
      <span className="text-xl">{emoji}</span>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
      <p className="text-xs text-ink-soft">{label}</p>
    </div>
  );
}
