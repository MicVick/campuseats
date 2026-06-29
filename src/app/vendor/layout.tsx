"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useVendorAuthStore } from "@/stores/vendorAuthStore";
import { BarChartIcon, ListIcon, MenuIcon, SettingsIcon, ClockIcon } from "@/components/icons";
import { cn } from "@/utils/format";

const NAV_ITEMS = [
  { href: "/vendor", icon: BarChartIcon, label: "Dashboard" },
  { href: "/vendor/orders", icon: ListIcon, label: "Orders" },
  { href: "/vendor/menu", icon: MenuIcon, label: "Menu" },
  { href: "/vendor/feedback", icon: ClockIcon, label: "Reviews" },
  { href: "/vendor/settings", icon: SettingsIcon, label: "Settings" },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const vendor = useVendorAuthStore((s) => s.vendor);
  const hydrated = useVendorAuthStore((s) => s.hydrated);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (hydrated && !vendor && pathname !== "/vendor/login") {
      router.replace("/vendor/login");
    }
  }, [hydrated, vendor, pathname, router]);

  // Not hydrated yet — blank screen (avoids flash)
  if (!hydrated) return null;

  // Login page has its own layout
  if (pathname === "/vendor/login") {
    return <>{children}</>;
  }

  // Still redirecting
  if (!vendor) return null;

  return (
    <div className="flex min-h-dvh bg-surface-muted">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r border-line bg-surface lg:flex lg:flex-col">
        <div className="border-b border-line px-5 py-4">
          <p className="text-lg font-black text-accent-600">CampusEats</p>
          <p className="mt-0.5 truncate text-xs text-ink-faint">{vendor.name}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/vendor" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-50 text-accent-700 font-semibold"
                    : "text-ink-soft hover:bg-surface-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 pb-20 lg:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface lg:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/vendor" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-accent-600" : "text-ink-faint"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
