"use client";

import { useState } from "react";
import { useVendorOrders, useVendorOrderAction } from "@/hooks/useVendorApi";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice, timeAgo, cn } from "@/utils/format";
import { useNewOrderSound } from "@/hooks/useNewOrderSound";

const TABS = [
  { key: "placed", label: "New" },
  { key: "active", label: "Active" },
  { key: "ready_for_pickup", label: "Ready" },
  { key: "completed", label: "Done" },
  { key: "rejected", label: "Rejected" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function VendorOrdersPage() {
  const [tab, setTab] = useState<TabKey>("placed");
  const toast = useToast();
  const orderAction = useVendorOrderAction();
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // For "active" tab, fetch all and filter; for others, pass specific status
  const statusQuery = tab === "active" ? undefined : tab;
  const { data: orders, isLoading } = useVendorOrders(statusQuery);

  // Separate query to track new order count for sound notification
  const { data: newOrders } = useVendorOrders("placed");
  useNewOrderSound(newOrders?.length);

  const filteredOrders = tab === "active"
    ? (orders ?? []).filter((o) => ["accepted", "preparing"].includes(o.status))
    : (orders ?? []);

  const handleAction = async (orderId: string, action: "accept" | "preparing" | "ready" | "complete") => {
    try {
      await orderAction.mutateAsync({ orderId, action });
      toast.success(
        action === "accept" ? "Order accepted" :
        action === "preparing" ? "Marked as preparing" :
        action === "ready" ? "Order is ready for pickup" :
        "Order completed"
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await orderAction.mutateAsync({
        orderId: rejectTarget,
        action: "reject",
        reason: rejectReason.trim() || "No reason provided",
      });
      toast.info("Order rejected");
      setRejectTarget(null);
      setRejectReason("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to reject");
    }
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-black text-ink">Orders</h1>

      {/* Tab bar */}
      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-pill px-4 py-2 text-sm font-semibold transition-colors",
              tab === t.key
                ? "bg-ink text-white"
                : "bg-surface text-ink-soft border border-line"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {isLoading && (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <EmptyState
            icon={tab === "placed" ? "🔔" : "📋"}
            title={`No ${TABS.find((t) => t.key === tab)?.label?.toLowerCase()} orders`}
            message="Orders will appear here as they come in."
          />
        )}

        {filteredOrders.map((order) => (
          <div key={order.id} className="rounded-xl bg-surface p-4 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-ink-faint">#{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="font-semibold text-ink">{order.user.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={order.status} />
                <span className="text-xs text-ink-faint">{timeAgo(order.placedAt)}</span>
              </div>
            </div>

            {/* Items */}
            <div className="mt-3 space-y-1.5">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-2 text-sm">
                  <span className="font-medium text-ink">
                    {item.qty}× {item.nameSnapshot}
                  </span>
                  {item.selectedOptions.length > 0 && (
                    <span className="text-xs text-ink-faint">
                      ({item.selectedOptions.map((o) => o.name).join(", ")})
                    </span>
                  )}
                  {item.itemNote && (
                    <span className="text-xs italic text-ink-faint">&ldquo;{item.itemNote}&rdquo;</span>
                  )}
                </div>
              ))}
            </div>

            {order.specialInstructions && (
              <p className="mt-2 rounded-lg bg-surface-muted px-3 py-2 text-xs text-ink-soft">
                📝 {order.specialInstructions}
              </p>
            )}

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
              <span className="font-bold text-ink">{formatPrice(order.grandTotal)}</span>

              <div className="flex gap-2">
                {order.status === "placed" && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-danger border-danger/30"
                      onClick={() => setRejectTarget(order.id)}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAction(order.id, "accept")}
                      disabled={orderAction.isPending}
                    >
                      Accept
                    </Button>
                  </>
                )}
                {order.status === "accepted" && (
                  <Button
                    size="sm"
                    onClick={() => handleAction(order.id, "preparing")}
                    disabled={orderAction.isPending}
                  >
                    Start Preparing
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button
                    size="sm"
                    onClick={() => handleAction(order.id, "ready")}
                    disabled={orderAction.isPending}
                  >
                    Mark Ready
                  </Button>
                )}
                {order.status === "ready_for_pickup" && (
                  <Button
                    size="sm"
                    onClick={() => handleAction(order.id, "complete")}
                    disabled={orderAction.isPending}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject dialog */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="animate-fade-in absolute inset-0 bg-black/45" onClick={() => setRejectTarget(null)} />
          <div className="animate-slide-up relative w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl">
            <h3 className="text-lg font-bold text-ink">Reject Order</h3>
            <p className="mt-1 text-sm text-ink-soft">Please provide a reason for the student.</p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-3 h-11 w-full rounded-xl border border-line bg-surface-muted px-3 text-sm text-ink focus:outline-none"
            >
              <option value="">Select a reason</option>
              <option value="Item(s) out of stock">Item(s) out of stock</option>
              <option value="Too busy right now">Too busy right now</option>
              <option value="Closing soon">Closing soon</option>
              <option value="Other">Other</option>
            </select>
            <div className="mt-4 flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setRejectTarget(null)}>
                Cancel
              </Button>
              <Button
                fullWidth
                className="bg-danger hover:bg-danger/90"
                onClick={handleReject}
                disabled={!rejectReason || orderAction.isPending}
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
