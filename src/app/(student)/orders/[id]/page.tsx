"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrder, useCancelOrder } from "@/hooks/useOrders";
import { useOrderStatusToast } from "@/hooks/useOrderStatusToast";
import { useToast } from "@/components/Toast";
import { RequireAuth } from "@/components/student/RequireAuth";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Sheet";
import { ChevronLeftIcon, MapPinIcon, ClockIcon } from "@/components/icons";
import { formatPrice, formatTime, ORDER_STATUS_LABEL, cn } from "@/utils/format";
import type { OrderStatus } from "@/types";

const STEPS: OrderStatus[] = ["placed", "accepted", "preparing", "ready_for_pickup", "completed"];

function OrderTrackingInner() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  useOrderStatusToast(order?.status);
  
  const cancelOrder = useCancelOrder();
  const toast = useToast();
  const [showCancel, setShowCancel] = useState(false);

  if (isLoading) return <TrackingSkeleton />;
  if (isError || !order) {
    return (
      <div className="min-h-dvh">
        <BackHeader />
        <ErrorState message="Couldn't load order." onRetry={() => refetch()} />
      </div>
    );
  }

  const isTerminal = ["completed", "cancelled", "rejected"].includes(order.status);
  const canCancel = ["placed", "accepted"].includes(order.status);
  const currentStepIdx = STEPS.indexOf(order.status as OrderStatus);

  const estimatedReady = order.estimatedPrepMins
    ? new Date(new Date(order.placedAt).getTime() + order.estimatedPrepMins * 60_000).toISOString()
    : null;

  const stalled =
    !isTerminal &&
    estimatedReady &&
    new Date().getTime() > new Date(estimatedReady).getTime() + 10 * 60_000;

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync(order.id);
      toast.info("Order cancelled");
      setShowCancel(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel");
    }
  };

  return (
    <div className="min-h-dvh pb-24">
      <BackHeader />

      {/* Status header */}
      <div className="bg-surface px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-ink-faint">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            <h1 className="mt-1 text-xl font-black text-ink">
              {order.status === "cancelled"
                ? "Order Cancelled"
                : order.status === "rejected"
                ? "Order Rejected"
                : ORDER_STATUS_LABEL[order.status] || order.status}
            </h1>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {order.status === "rejected" && order.rejectionReason && (
          <div className="mt-3 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
            <p className="font-semibold">Rejection reason</p>
            <p className="mt-0.5">{order.rejectionReason}</p>
          </div>
        )}

        {stalled && !isTerminal && (
          <div className="mt-3 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
            ⏳ Taking longer than usual. Your order is still being prepared.
          </div>
        )}
      </div>

      {/* Status stepper */}
      {!["cancelled", "rejected"].includes(order.status) && (
        <div className="mt-3 bg-surface px-4 py-5">
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-0">
              {STEPS.map((step, i) => {
                const done = i <= currentStepIdx;
                const timeEntry = order.statusTimeline.find((t) => t.status === step);
                return (
                  <div key={step} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          done
                            ? "bg-veg text-white"
                            : "border-2 border-line bg-surface text-ink-faint"
                        )}
                      >
                        {done ? "✓" : i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div
                          className={cn(
                            "w-0.5 h-8",
                            i < currentStepIdx ? "bg-veg" : "bg-line"
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={cn("text-sm font-semibold", done ? "text-ink" : "text-ink-faint")}>
                        {ORDER_STATUS_LABEL[step]}
                      </p>
                      {timeEntry && (
                        <p className="text-xs text-ink-faint">{formatTime(timeEntry.at)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {estimatedReady && !isTerminal && (
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-surface-muted px-3 py-2.5 text-xs text-ink-soft">
              <ClockIcon className="h-4 w-4" />
              <span>Estimated ready by {formatTime(estimatedReady)}</span>
            </div>
          )}
        </div>
      )}

      {/* Order items */}
      <div className="mt-3 bg-surface px-4 py-4">
        <h3 className="mb-3 text-sm font-bold text-ink">Order details</h3>
        <div className="divide-y divide-line rounded-xl border border-line">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-ink">{item.nameSnapshot}</span>
                  <span className="text-xs text-ink-faint">×{item.qty}</span>
                </div>
                {item.selectedOptions.length > 0 && (
                  <p className="text-xs text-ink-faint">
                    {item.selectedOptions.map((o) => o.name).join(", ")}
                  </p>
                )}
              </div>
              <span className="ml-3 text-sm font-medium text-ink">
                {formatPrice(item.unitPrice * item.qty)}
              </span>
            </div>
          ))}
        </div>

        {order.specialInstructions && (
          <div className="mt-3 rounded-xl bg-surface-muted px-3 py-2.5 text-xs text-ink-soft">
            <span className="font-semibold">Note:</span> {order.specialInstructions}
          </div>
        )}

        {/* Bill */}
        <div className="mt-4 space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Item total</span>
            <span>{formatPrice(order.itemTotal)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Packaging</span>
            <span>{formatPrice(order.packagingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 font-bold text-ink">
            <span>Total</span>
            <span>{formatPrice(order.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Vendor info */}
      {order.vendor && (
        <div className="mt-3 bg-surface px-4 py-4">
          <h3 className="mb-2 text-sm font-bold text-ink">Pickup from</h3>
          <p className="text-sm font-semibold text-ink">{order.vendor.name}</p>
          {order.vendor.area && (
            <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
              <MapPinIcon className="h-3.5 w-3.5" /> {order.vendor.area}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 bg-surface px-4 py-4 space-y-3">
        {(order.vendor?.upiId || order.vendor?.upiQrImageUrl) && (
          <Link href={`/orders/${order.id}/upi`}>
            <Button fullWidth variant="secondary">💳 View UPI Details</Button>
          </Link>
        )}
        {canCancel && (
          <Button
            fullWidth
            variant="secondary"
            className="text-danger"
            onClick={() => setShowCancel(true)}
            disabled={cancelOrder.isPending}
          >
            Cancel Order
          </Button>
        )}
        {order.status === "completed" && !order.hasReview && (
          <Link href={`/orders/${order.id}/feedback`}>
            <Button fullWidth variant="secondary">⭐ Rate & Leave Feedback</Button>
          </Link>
        )}
      </div>

      {/* Cancel dialog */}
      <ConfirmDialog
        open={showCancel}
        title="Cancel this order?"
        message="Are you sure you want to cancel? This cannot be undone."
        confirmLabel="Yes, Cancel"
        destructive
        onCancel={() => setShowCancel(false)}
        onConfirm={handleCancel}
      />
    </div>
  );
}

function BackHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
      <Link href="/orders" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink">
        <ChevronLeftIcon className="h-5 w-5" />
      </Link>
      <h1 className="text-xl font-black text-ink">Order Details</h1>
    </header>
  );
}

function TrackingSkeleton() {
  return (
    <div className="min-h-dvh">
      <BackHeader />
      <div className="space-y-3 p-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-4 h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <RequireAuth>
      <OrderTrackingInner />
    </RequireAuth>
  );
}
