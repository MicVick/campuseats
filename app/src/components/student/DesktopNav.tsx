"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, ReceiptIcon, UserIcon, CartIcon } from "@/components/icons";
import { useCartStore } from "@/stores/cartStore";
import { cn, formatPrice } from "@/utils/format";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon, match: (p: string) => p === "/" },
  {
    href: "/search",
    label: "Search",
    Icon: SearchIcon,
    match: (p: string) => p.startsWith("/search"),
  },
  {
    href: "/orders",
    label: "Orders",
    Icon: ReceiptIcon,
    match: (p: string) => p.startsWith("/orders") || p.startsWith("/order/"),
  },
  {
    href: "/profile",
    label: "Profile",
    Icon: UserIcon,
    match: (p: string) => p.startsWith("/profile") || p.startsWith("/favourites"),
  },
];

export function DesktopNav() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.cartCount());
  const cartTotal = useCartStore((s) => s.cartItemTotal());

  return (
    <nav className="sticky top-0 z-50 hidden w-full border-b border-line bg-surface/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-brand">CampusEats</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {NAV_ITEMS.map(({ href, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-ink",
                  active ? "text-brand" : "text-ink-soft"
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-brand" : "text-ink-soft")} />
                {label}
              </Link>
            );
          })}

          {/* Cart Summary */}
          {cartCount > 0 && (
            <Link
              href="/cart"
              className="ml-4 flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-bold text-brand transition-colors hover:bg-brand-100"
            >
              <div className="relative">
                <CartIcon className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              </div>
              {formatPrice(cartTotal)}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
