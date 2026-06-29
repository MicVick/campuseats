"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireAuth } from "@/components/student/RequireAuth";
import { useOrders } from "@/hooks/useOrders";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/components/Toast";
import { StatusBadge } from "@/components/ui/Badge";
import { VendorListSkeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { formatPrice, formatDateTime, timeAgo, cn } from "@/utils/format";
import type { Order } from "@/types";

function OrdersInner() {
  const [tab, setTab] = useState<"active" | "past">("active");
  const { data: orders, isLoading, isError, refetch } = useOrders();

  const active = (orders ?? []).filter(
    (o) => !["completed", "cancelled", "rejected"].includes(o.status)
  );
  const past = (orders ?? []).filter((o) =>
    ["completed", "cancelled", "rejected"].includes(o.status)
  );
  const list = tab === "active" ? active : past;

  return (
    <div>
      <header className="sticky top-0 z-20 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
        <h1 className="text-xl font-black text-ink">Orders</h1>
        {/* Tabs */}
        <div className="mt-3 flex gap-1 rounded-xl bg-surface-muted p-1">
          {(["active", "past"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                tab === t
                  ? "bg-surface text-ink shadow-sm"
                  : "text-ink-faint"
              )}
            >
              {t === "active" ? `Active (${active.length})` : `Past (${past.length})`}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4">
        {isLoading && <VendorListSkeleton count={3} />}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {!isLoading && !isError && list.length === 0 && (
          <EmptyState
            icon={tab === "active" ? "🧾" : "📋"}
            title={tab === "active" ? "No active orders" : "No past orders"}
            message={
              tab === "active"
                ? "Your current orders will appear here."
                : "Your completed orders will appear here."
            }
            action={
              <Link
                href="/"
                className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Browse vendors
              </Link>
            }
          />
        )}

        {!isLoading && list.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const router = useRouter();
  const toast = useToast();
  const addItem = useCartStore((s) => s.addItem);
  const clear = useCartStore((s) => s.clear);
  const isDifferentVendor = useCartStore((s) => s.isDifferentVendor);

  const itemSummary =
    order.items.length <= 2
      ? order.items.map((i) => `${i.nameSnapshot} ×${i.qty}`).join(", ")
      : `${order.items[0].nameSnapshot} ×${order.items[0].qty} +${order.items.length - 1} more`;

  const handleReorder = (e: React.MouseEvent) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();

    if (isDifferentVendor(order.vendorId)) {
      clear();
    }

    for (const item of order.items) {
      addItem(
        {
          id: order.vendorId,
          name: order.vendor?.name ?? "Vendor",
          packagingFee: order.packagingFee,
          minOrder: 0,
        },
        {
          menuItemId: item.menuItemId,
          name: item.nameSnapshot,
          basePrice: item.unitPrice,
          selectedOptions: item.selectedOptions,
          itemNote: item.itemNote ?? undefined,
          isVeg: true, // fallback since order items don't store this
          qty: item.qty,
        }
      );
    }
    toast.success("Items added to cart!");
    router.push("/cart");
  };

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-card bg-surface p-4 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{order.vendor?.name}</p>
          <p className="mt-0.5 truncate text-xs text-ink-soft">{itemSummary}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-ink-faint">
        <span>{formatDateTime(order.placedAt)}</span>
        <span className="font-semibold text-ink">{formatPrice(order.grandTotal)}</span>
      </div>

      {/* Action hints */}
      {order.status === "completed" && !order.hasReview && (
        <div className="mt-2 rounded-lg bg-accent-50 px-3 py-2 text-xs font-semibold text-accent-600">
          ⭐ Rate this order
        </div>
      )}
      {order.status === "completed" && !order.hasFeedback && order.hasReview && (
        <div className="mt-2 rounded-lg bg-mvrc-soft px-3 py-2 text-xs font-semibold text-mvrc">
          📝 Leave food feedback
        </div>
      )}

      {/* Reorder button */}
      {order.status === "completed" && (
        <button
          onClick={handleReorder}
          className="mt-2 w-full rounded-lg border border-accent-200 bg-accent-50 px-3 py-2 text-xs font-semibold text-accent-600 transition-colors hover:bg-accent-100 active:scale-[0.98]"
        >
          🔄 Reorder
        </button>
      )}
    </Link>
  );
}

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersInner />
    </RequireAuth>
  );
}
