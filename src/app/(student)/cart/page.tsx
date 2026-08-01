"use client";

import Link from "next/link";
import { useCartStore, lineTotal, lineUnitPrice, cartItemTotal, cartCount } from "@/stores/cartStore";
import { Stepper } from "@/components/ui/Stepper";
import { VegDot } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { XIcon, ChevronLeftIcon } from "@/components/icons";
import { formatPrice, cn } from "@/utils/format";

export default function CartPage() {
  const lines = useCartStore((s) => s.lines);
  const vendorId = useCartStore((s) => s.vendorId);
  const vendorName = useCartStore((s) => s.vendorName);
  const packagingFee = useCartStore((s) => s.packagingFee);
  const minOrder = useCartStore((s) => s.minOrder);
  const incQty = useCartStore((s) => s.incQty);
  const decQty = useCartStore((s) => s.decQty);
  const removeLine = useCartStore((s) => s.removeLine);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
          <Link href="/" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-black text-ink">Cart</h1>
        </header>
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Add items from a vendor to get started."
          action={
            <Link href="/" className="rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white">
              Browse vendors
            </Link>
          }
        />
      </div>
    );
  }

  const itemTotal = cartItemTotal(lines);
  const grandTotal = itemTotal + packagingFee;
  const count = cartCount(lines);
  const belowMin = itemTotal < minOrder;
  const shortfall = minOrder - itemTotal;

  return (
    <div className="min-h-dvh">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-surface/95 px-4 pb-3 pt-4 backdrop-blur">
        <Link href="/" aria-label="Back" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-ink">Cart</h1>
          <p className="text-xs text-ink-soft">{vendorName} · {count} item{count !== 1 ? "s" : ""}</p>
        </div>
      </header>

      {/* Items */}
      <div className="bg-surface px-4 py-2">
        <div className="divide-y divide-line">
          {lines.map((line) => (
            <div key={line.lineId} className="flex items-start gap-3 py-4">
              <div className="min-w-0 flex-1">
                <div className="mb-0.5"><VegDot isVeg={line.isVeg} /></div>
                <h3 className="font-semibold text-ink">{line.name}</h3>
                {line.selectedOptions.length > 0 && (
                  <p className="mt-0.5 text-xs text-ink-faint">
                    {line.selectedOptions.map((o) => o.name).join(", ")}
                  </p>
                )}
                {line.itemNote && (
                  <p className="mt-0.5 text-xs text-ink-faint italic">&ldquo;{line.itemNote}&rdquo;</p>
                )}
                <p className="mt-1 text-sm font-medium text-ink">
                  {formatPrice(lineTotal(line))}
                  {line.qty > 1 && (
                    <span className="ml-1 text-xs text-ink-faint">
                      ({formatPrice(lineUnitPrice(line))} × {line.qty})
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Stepper
                  size="sm"
                  value={line.qty}
                  onInc={() => incQty(line.lineId)}
                  onDec={() => decQty(line.lineId)}
                />
                <button
                  onClick={() => removeLine(line.lineId)}
                  className="text-ink-faint transition-colors hover:text-danger"
                  aria-label="Remove item"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add more items */}
        <Link
          href={vendorId ? `/vendors/${vendorId}` : "/"}
          className="mt-2 flex items-center justify-center gap-1 rounded-xl border border-dashed border-accent-300 py-3 text-sm font-semibold text-accent-600 transition-colors hover:bg-accent-50"
        >
          + Add more items
        </Link>
      </div>

      {/* Price Breakdown */}
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
              <span>Grand total</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Min order warning */}
      {belowMin && (
        <div className="mx-4 mt-3 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
          <p className="font-semibold">Below minimum order</p>
          <p className="mt-0.5 text-xs">Add {formatPrice(shortfall)} more to place an order.</p>
        </div>
      )}

      {/* Checkout button */}
      <div className="sticky bottom-16 border-t border-line bg-surface px-4 py-3">
        <Link href="/checkout">
          <Button
            fullWidth
            size="lg"
            disabled={belowMin}
            className={cn(belowMin && "opacity-50")}
          >
            Proceed to Checkout — {formatPrice(grandTotal)}
          </Button>
        </Link>
        </div>
      </div>
    </div>
  );
}
