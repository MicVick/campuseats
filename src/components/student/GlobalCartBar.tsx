"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore, cartCount, cartItemTotal } from "@/stores/cartStore";
import { CartIcon } from "@/components/icons";
import { formatPrice } from "@/utils/format";

/** Persistent cart bar shown above the tab bar whenever the cart has items.
 *  Hidden on the cart/checkout pages themselves. */
export function GlobalCartBar() {
  const pathname = usePathname();
  const lines = useCartStore((s) => s.lines);
  const vendorName = useCartStore((s) => s.vendorName);

  const hidden =
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/order");

  if (lines.length === 0 || hidden) return null;

  const count = cartCount(lines);
  const total = cartItemTotal(lines);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[4.25rem] z-30 px-4 md:hidden">
      <Link
        href="/cart"
        className="animate-slide-up pointer-events-auto mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-accent-500 px-4 py-3 text-white shadow-lg shadow-accent-500/30"
      >
        <div className="flex items-center gap-3">
          <span className="relative">
            <CartIcon className="h-6 w-6" />
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-accent-600">
              {count}
            </span>
          </span>
          <span className="text-sm font-semibold">
            {vendorName ? <span className="line-clamp-1">{vendorName}</span> : "Your cart"}
          </span>
        </div>
        <span className="flex items-center gap-2 text-sm font-bold">
          {formatPrice(total)}
          <span className="opacity-90">View Cart →</span>
        </span>
      </Link>
    </div>
  );
}
