"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, ReceiptIcon, UserIcon } from "@/components/icons";
import { cn } from "@/utils/format";

const TABS = [
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

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/50 bg-surface/70 backdrop-blur-xl pb-safe md:hidden transition-all duration-300">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-accent-600" : "text-ink-faint"
              )}
            >
              {active && (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent-500" />
              )}
              <Icon className="h-6 w-6" filled={active} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
