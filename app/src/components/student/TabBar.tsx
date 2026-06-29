"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  SearchIcon,
  ReceiptIcon,
  UserIcon,
} from "@/components/icons";
import { cn } from "@/utils/format";

const TABS = [
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

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-safe">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-accent-600" : "text-ink-faint"
              )}
            >
              <Icon className="h-6 w-6" filled={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
