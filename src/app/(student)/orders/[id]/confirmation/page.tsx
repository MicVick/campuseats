"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { CheckIcon } from "@/components/icons";
import { formatPrice, formatTime } from "@/utils/format";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading || !order) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-surface px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <Skeleton className="mx-auto h-20 w-20 rounded-full" />
          <Skeleton className="mx-auto h-6 w-48" />
          <Skeleton className="mx-auto h-4 w-64" />
        </div>
      </div>
    );
  }

  const estimatedReady = order.estimatedPrepMins
    ? new Date(
        new Date(order.placedAt).getTime() + order.estimatedPrepMins * 60_000
      ).toISOString()
    : null;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 py-10 text-center">
      {/* Success icon */}
      <div className="animate-slide-up mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-veg/10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-veg text-white">
          <CheckIcon className="h-8 w-8" />
        </div>
      </div>

      <h1 className="animate-slide-up text-2xl font-black text-ink">Order Placed!</h1>
      <p className="animate-slide-up mt-2 text-sm text-ink-soft">
        Your order has been placed with <span className="font-semibold text-ink">{order.vendor?.name}</span>
      </p>

      {/* Order ID */}
      <div className="animate-slide-up mt-6 rounded-xl bg-surface-muted px-6 py-4">
        <p className="text-xs text-ink-faint">Order ID</p>
        <p className="mt-0.5 font-mono text-sm font-bold text-ink">
          {order.id.slice(0, 8).toUpperCase()}
        </p>
        {estimatedReady && (
          <>
            <p className="mt-3 text-xs text-ink-faint">Estimated ready by</p>
            <p className="mt-0.5 text-lg font-bold text-accent-600">
              {formatTime(estimatedReady)}
            </p>
          </>
        )}
        <p className="mt-3 text-xs text-ink-faint">Total</p>
        <p className="mt-0.5 text-lg font-bold text-ink">{formatPrice(order.grandTotal)}</p>
      </div>

      {/* Actions */}
      <div className="animate-slide-up mt-8 flex w-full max-w-xs flex-col gap-3">
        {(order.vendor?.upiId || order.vendor?.upiQrImageUrl) && (
          <Link href={`/orders/${order.id}/upi`}>
            <Button fullWidth variant="secondary" size="lg">
              💳 View UPI Payment Details
            </Button>
          </Link>
        )}
        <Link href={`/orders/${order.id}`}>
          <Button fullWidth size="lg">
            Track Order
          </Button>
        </Link>
        <Link href="/" className="mt-2 text-sm font-semibold text-accent-600">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
