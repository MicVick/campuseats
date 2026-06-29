"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ReceiptIcon, UserIcon, CartIcon } from "@/components/icons";
import { useCartStore, cartCount, cartItemTotal } from "@/stores/cartStore";
import { cn, formatPrice } from "@/utils/format";

const NAV_ITEMS = [
  { href: "/", label: "Home", Icon: HomeIcon, match: (p: string) => p === "/" },
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
    match: (p: string) => p.startsWith("/profile"),
  },
];

export function DesktopNav() {
  const pathname = usePathname();
  const lines = useCartStore((s) => s.lines);

  const count = cartCount(lines);
  const total = cartItemTotal(lines);

  return (
    <nav className="sticky top-0 z-50 hidden w-full border-b border-line bg-surface/90 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-base">
            🍴
          </span>
          <span className="text-xl font-black tracking-tight text-accent-600">
            CampusEats
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-7">
          {NAV_ITEMS.map(({ href, label, Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 text-sm font-semibold transition-colors hover:text-accent-600",
                  active ? "text-accent-600" : "text-ink-soft"
                )}
              >
                <Icon className="h-5 w-5" filled={active} />
                {label}
              </Link>
            );
          })}

          {/* Cart summary */}
          {count > 0 && (
            <Link
              href="/cart"
              className="ml-2 flex items-center gap-2 rounded-full bg-accent-50 px-4 py-2 text-sm font-bold text-accent-700 transition-colors hover:bg-accent-100"
            >
              <span className="relative">
                <CartIcon className="h-5 w-5" />
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              </span>
              {formatPrice(total)}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
