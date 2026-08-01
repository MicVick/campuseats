"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore, cartItemTotal, cartCount } from "@/stores/cartStore";
import { usePlaceOrder } from "@/hooks/useOrders";
import { useToast } from "@/components/Toast";
import { RequireAuth } from "@/components/student/RequireAuth";
import { Button } from "@/components/ui/Button";
import { VegDot } from "@/components/ui/Badge";
import { ChevronLeftIcon } from "@/components/icons";
import { formatPrice } from "@/utils/format";

function CheckoutInner() {
  const router = useRouter();
  const toast = useToast();
  const lines = useCartStore((s) => s.lines);
  const vendorId = useCartStore((s) => s.vendorId);
  const vendorName = useCartStore((s) => s.vendorName);
  const packagingFee = useCartStore((s) => s.packagingFee);
  const clear = useCartStore((s) => s.clear);

  const [specialInstructions, setSpecialInstructions] = useState("");
  const placeOrder = usePlaceOrder();

  if (!vendorId || lines.length === 0) {
    router.replace("/cart");
    return null;
  }

  const itemTotal = cartItemTotal(lines);
  const grandTotal = itemTotal + packagingFee;
  const count = cartCount(lines);

  const handlePlaceOrder = async () => {
    try {
      const order = await placeOrder.mutateAsync({
        vendorId,
        items: lines.map((l) => ({
          menuItemId: l.menuItemId,
          qty: l.qty,
          selectedOptions: l.selectedOptions,
          itemNote: l.itemNote,
        })),
        specialInstructions: specialInstructions.trim() || undefined,
      });
      clear();
      router.push(`/orders/${order.id}/confirmation`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to place order";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
        <Link href="/cart" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-black text-ink">Checkout</h1>
      </header>

      {/* Order summary */}
      <div className="bg-surface px-4 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <span className="text-lg">🍽️</span>
          <span>{vendorName}</span>
          <span className="ml-auto text-xs text-ink-faint">{count} item{count !== 1 ? "s" : ""}</span>
        </div>

        <div className="mt-3 divide-y divide-line rounded-xl border border-line">
          {lines.map((line) => (
            <div key={line.lineId} className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <VegDot isVeg={line.isVeg} />
                <span className="truncate text-sm text-ink">{line.name}</span>
                <span className="text-xs text-ink-faint">×{line.qty}</span>
              </div>
              <span className="ml-3 shrink-0 text-sm font-medium text-ink">
                {formatPrice((line.basePrice + line.selectedOptions.reduce((s, o) => s + o.priceDelta, 0)) * line.qty)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Special instructions */}
      <div className="mt-3 bg-surface px-4 py-4">
        <label className="text-sm font-semibold text-ink">Special instructions</label>
        <textarea
          value={specialInstructions}
          onChange={(e) => setSpecialInstructions(e.target.value)}
          placeholder="Any requests for the vendor? (optional)"
          maxLength={500}
          rows={2}
          className="mt-2 w-full rounded-xl border border-line bg-surface-muted px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent-400 focus:outline-none"
        />
      </div>

      {/* Payment */}
      <div className="mt-3 bg-surface px-4 py-4">
        <h3 className="text-sm font-semibold text-ink">Payment method</h3>
        <div className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3">
          <span className="text-xl">💵</span>
          <div>
            <p className="text-sm font-semibold text-ink">Cash on Pickup</p>
            <p className="text-xs text-ink-faint">Pay when you collect your order</p>
          </div>
        </div>
      </div>

      {/* Bill */}
      <div className="mt-3 bg-surface px-4 py-4">
        <h3 className="mb-3 text-sm font-bold text-ink">Bill details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Item total</span>
            <span>{formatPrice(itemTotal)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Packaging fee</span>
            <span>{formatPrice(packagingFee)}</span>
          </div>
          <div className="border-t border-line pt-2">
            <div className="flex justify-between font-bold text-ink">
              <span>To pay</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
        {/* Place Order */}
        <div className="sticky bottom-16 border-t border-line bg-surface px-4 py-3">
          <Button
            fullWidth
            size="lg"
            onClick={handlePlaceOrder}
            disabled={placeOrder.isPending}
          >
            {placeOrder.isPending ? "Placing order…" : `Place Order — ${formatPrice(grandTotal)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutInner />
    </RequireAuth>
  );
}
