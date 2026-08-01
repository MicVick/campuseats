"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useParams } from "next/navigation";
import { useOrder } from "@/hooks/useOrders";
import { RequireAuth } from "@/components/student/RequireAuth";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import { ChevronLeftIcon, CopyIcon } from "@/components/icons";
import { formatPrice } from "@/utils/format";
import { useToast } from "@/components/Toast";

function UpiInner() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading, isError, refetch } = useOrder(id);
  const toast = useToast();

  const copyUpi = () => {
    if (order?.vendor?.upiId) {
      navigator.clipboard.writeText(order.vendor.upiId).then(
        () => toast.success("UPI ID copied!"),
        () => toast.error("Failed to copy")
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-dvh">
        <BackHeader orderId={id} />
        <div className="space-y-4 p-4">
          <Skeleton className="mx-auto h-64 w-64 rounded-xl" />
          <Skeleton className="mx-auto h-6 w-48" />
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-dvh">
        <BackHeader orderId={id} />
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const hasUpi = order.vendor?.upiId || order.vendor?.upiQrImageUrl;

  return (
    <div className="min-h-dvh">
      <BackHeader orderId={id} />

      <div className="px-4 py-6 text-center">
        {/* Total */}
        <div className="mb-6">
          <p className="text-sm text-ink-faint">Amount to pay</p>
          <p className="text-3xl font-black text-ink">{formatPrice(order.grandTotal)}</p>
          <p className="mt-1 text-xs text-ink-soft">to {order.vendor?.name}</p>
        </div>

        {hasUpi ? (
          <>
            {/* QR Code */}
            {order.vendor?.upiQrImageUrl && (
              <div className="mx-auto mb-6 w-fit rounded-2xl border-2 border-line bg-white p-4">
                <img
                  src={order.vendor.upiQrImageUrl}
                  alt="UPI QR Code"
                  className="h-56 w-56 object-contain"
                />
              </div>
            )}

            {/* UPI ID */}
            {order.vendor?.upiId && (
              <div className="mx-auto max-w-sm">
                <p className="mb-2 text-sm text-ink-soft">Or pay using UPI ID</p>
                <button
                  onClick={copyUpi}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-muted px-4 py-3 font-mono text-sm font-bold text-ink transition-colors hover:bg-line active:scale-[0.98]"
                >
                  {order.vendor.upiId}
                  <CopyIcon className="h-4 w-4 text-ink-faint" />
                </button>
                <p className="mt-1 text-xs text-ink-faint">Tap to copy</p>
              </div>
            )}

            {/* Instructions */}
            <div className="mx-auto mt-8 max-w-sm rounded-xl bg-accent-50 px-4 py-3 text-left text-sm text-accent-800">
              <p className="font-semibold">How to pay</p>
              <ol className="mt-1.5 list-inside list-decimal space-y-1 text-xs">
                <li>Scan the QR code or copy the UPI ID above</li>
                <li>Pay {formatPrice(order.grandTotal)} via any UPI app</li>
                <li>Show the payment confirmation at pickup</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="mx-auto max-w-sm rounded-xl bg-surface-muted px-6 py-8 text-center">
            <span className="text-4xl">💵</span>
            <h2 className="mt-3 text-lg font-bold text-ink">Pay cash at counter</h2>
            <p className="mt-1 text-sm text-ink-soft">
              This vendor doesn&apos;t have UPI configured. Please pay in cash when you pick up your order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BackHeader({ orderId }: { orderId: string }) {
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
      <Link href={`/orders/${orderId}`} aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink">
        <ChevronLeftIcon className="h-5 w-5" />
      </Link>
      <h1 className="text-xl font-black text-ink">Payment</h1>
    </header>
  );
}

export default function UpiPage() {
  return (
    <RequireAuth>
      <UpiInner />
    </RequireAuth>
  );
}
