"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useVendor } from "@/hooks/useVendors";
import { usePrefsStore } from "@/stores/prefsStore";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/components/Toast";
import { FoodImage } from "@/components/FoodImage";
import { VegToggle } from "@/components/ui/VegToggle";
import { VegDot, RatingBadge, MvrcBadge, OpenBadge } from "@/components/ui/Badge";
import { Stepper } from "@/components/ui/Stepper";
import { ConfirmDialog } from "@/components/ui/Sheet";
import { MenuItemSkeleton, Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/EmptyState";
import {
  ItemCustomizationSheet,
  type PendingLine,
} from "@/components/student/ItemCustomizationSheet";
import { ChevronLeftIcon, ClockIcon, MapPinIcon } from "@/components/icons";
import { formatPrice, todayHoursLabel, cn } from "@/utils/format";
import type { MenuItem, VendorDetail } from "@/types";

export default function VendorPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const deepLinkItem = searchParams.get("item");

  const vegOnly = usePrefsStore((s) => s.vegOnly);
  const { data: vendor, isLoading, isError, refetch } = useVendor(id);

  if (isLoading) return <VendorPageSkeleton />;
  if (isError || !vendor)
    return (
      <div className="min-h-dvh">
        <BackBar />
        <ErrorState message="Couldn't load this vendor." onRetry={() => refetch()} />
      </div>
    );

  return (
    <VendorContent vendor={vendor} vegOnly={vegOnly} deepLinkItem={deepLinkItem} />
  );
}

function VendorContent({
  vendor,
  vegOnly,
  deepLinkItem,
}: {
  vendor: VendorDetail;
  vegOnly: boolean;
  deepLinkItem: string | null;
}) {
  const toast = useToast();
  const cart = useCartStore();

  const [activeCat, setActiveCat] = useState<string>("");
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null);
  const [pending, setPending] = useState<PendingLine | null>(null);
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Filter to categories with at least one (optionally veg) item.
  const categories = useMemo(() => {
    return vendor.categories
      .map((c) => ({
        ...c,
        items: vegOnly ? c.items.filter((i) => i.isVeg) : c.items,
      }))
      .filter((c) => c.items.length > 0);
  }, [vendor.categories, vegOnly]);

  // Deep-link: open the customization sheet or scroll to the item.
  useEffect(() => {
    if (!deepLinkItem) return;
    for (const c of vendor.categories) {
      const item = c.items.find((i) => i.id === deepLinkItem);
      if (item) {
        sectionRefs.current[c.id]?.scrollIntoView({ behavior: "smooth" });
        if (item.customizationGroups.length > 0 && item.isAvailable) {
          setSheetItem(item);
        }
        break;
      }
    }
  }, [deepLinkItem, vendor.categories]);

  const closed = !vendor.isOpen;

  /** Quantity of a simple (non-customised) item currently in cart. */
  const cartLineForSimpleItem = (itemId: string) =>
    cart.vendorId === vendor.id
      ? cart.lines.find(
          (l) => l.menuItemId === itemId && l.selectedOptions.length === 0 && !l.itemNote
        )
      : undefined;

  const itemQtyInCart = (itemId: string) =>
    cart.vendorId === vendor.id
      ? cart.lines
          .filter((l) => l.menuItemId === itemId)
          .reduce((s, l) => s + l.qty, 0)
      : 0;

  const doAdd = (line: PendingLine) => {
    cart.addItem(
      {
        id: vendor.id,
        name: vendor.name,
        packagingFee: vendor.packagingFee,
        minOrder: vendor.minOrder,
      },
      line
    );
    toast.success(`Added ${line.name}`);
  };

  /** Entry point for adding — enforces the single-vendor rule. */
  const requestAdd = (line: PendingLine) => {
    if (cart.isDifferentVendor(vendor.id)) {
      setPending(line);
      setConfirmSwitch(true);
      return;
    }
    doAdd(line);
  };

  const onAddItem = (item: MenuItem) => {
    if (closed) {
      toast.info(
        vendor.nextOpenTime ? `Opens ${vendor.nextOpenTime}` : "Vendor is closed"
      );
      return;
    }
    if (item.customizationGroups.length > 0) {
      setSheetItem(item);
    } else {
      requestAdd({
        menuItemId: item.id,
        name: item.name,
        basePrice: item.price,
        isVeg: item.isVeg,
        qty: 1,
        selectedOptions: [],
      });
    }
  };

  const scrollToCat = (catId: string) => {
    setActiveCat(catId);
    sectionRefs.current[catId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-dvh">
      {/* Banner */}
      <div className="relative">
        <FoodImage
          src={vendor.imageUrl}
          alt={vendor.name}
          name={vendor.name}
          className="h-44 w-full"
          emoji="🍴"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <Link
          href="/"
          onClick={(e) => {
            e.preventDefault();
            history.back();
          }}
          aria-label="Back"
          className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink shadow backdrop-blur"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
      </div>

      {/* Vendor info card */}
      <div className="relative -mt-6 rounded-t-3xl bg-surface px-4 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-black text-ink">{vendor.name}</h1>
            <p className="mt-0.5 line-clamp-1 text-sm text-ink-soft">
              {vendor.cuisineTags.join(" · ")}
            </p>
          </div>
          <OpenBadge isOpen={!!vendor.isOpen} nextOpenTime={vendor.nextOpenTime} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {vendor.avgRating > 0 && (
            <RatingBadge rating={vendor.avgRating} count={vendor.ratingCount} />
          )}
          <span className="inline-flex items-center gap-1 text-xs text-ink-soft">
            <ClockIcon className="h-4 w-4" /> {vendor.avgPrepTimeMins} min
          </span>
          {vendor.hasVeg && <VegDot isVeg size={13} />}
          {vendor.hasNonVeg && <VegDot isVeg={false} size={13} />}
        </div>

        {vendor.description && (
          <p className="mt-2.5 text-sm text-ink-soft">{vendor.description}</p>
        )}

        <div className="mt-3 space-y-1.5 rounded-xl bg-surface-muted p-3 text-xs text-ink-soft">
          <p className="flex items-center gap-1.5">
            <MapPinIcon className="h-4 w-4 shrink-0" /> {vendor.area}
          </p>
          <p className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 shrink-0" />{" "}
            {todayHoursLabel(vendor.openHours)}
          </p>
          <p className="flex flex-wrap gap-x-3">
            {vendor.minOrder > 0 && <span>Min order {formatPrice(vendor.minOrder)}</span>}
            {vendor.packagingFee > 0 && (
              <span>Packaging {formatPrice(vendor.packagingFee)}</span>
            )}
          </p>
        </div>

        {/* MVRC transparency band */}
        <Link
          href={`/vendors/${vendor.id}/mvrc`}
          className="mt-3 flex items-center justify-between rounded-xl border border-mvrc/20 bg-mvrc-soft px-3.5 py-3"
        >
          <div className="flex items-center gap-3">
            <MvrcBadge rating={vendor.mvrcRating} />
            <div className="text-xs text-ink-soft">
              <p className="font-semibold text-ink">Mess & Vendor Review</p>
              <p>
                {vendor.mvrcAssessmentDate
                  ? `Assessed ${new Date(vendor.mvrcAssessmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                  : "Awaiting assessment"}
              </p>
            </div>
          </div>
          <span className="text-sm font-semibold text-mvrc">View Report →</span>
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <Link
            href={`/feedback/${vendor.id}`}
            className="text-sm font-semibold text-accent-600"
          >
            Leave Feedback
          </Link>
          <VegToggle />
        </div>
      </div>

      {/* Sticky category nav */}
      {categories.length > 1 && (
        <div className="no-scrollbar sticky top-0 z-20 flex gap-2 overflow-x-auto border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => scrollToCat(c.id)}
              className={cn(
                "shrink-0 rounded-pill px-3 py-1.5 text-sm font-semibold transition-colors",
                activeCat === c.id
                  ? "bg-ink text-white"
                  : "bg-surface-muted text-ink-soft"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu */}
      <div className="bg-surface px-4 pb-10">
        {categories.length === 0 && (
          <p className="py-16 text-center text-sm text-ink-faint">
            {vegOnly
              ? "No vegetarian items at this vendor."
              : "No items on the menu yet."}
          </p>
        )}

        {categories.map((cat) => (
          <section
            key={cat.id}
            ref={(el) => {
              sectionRefs.current[cat.id] = el;
            }}
            className="scroll-mt-16 pt-5"
          >
            <h2 className="mb-1 text-base font-bold text-ink">{cat.name}</h2>
            <div className="divide-y divide-line">
              {cat.items.map((item) => {
                const simpleLine = cartLineForSimpleItem(item.id);
                const qty = itemQtyInCart(item.id);
                const hasOptions = item.customizationGroups.length > 0;
                const disabled = !item.isAvailable || closed;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-start justify-between gap-3 py-4",
                      !item.isAvailable && "opacity-60"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-1">
                        <VegDot isVeg={item.isVeg} />
                      </div>
                      <h3 className="font-semibold text-ink">{item.name}</h3>
                      <p className="text-sm font-medium text-ink">
                        {formatPrice(item.price)}
                      </p>
                      {item.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-ink-soft">
                          {item.description}
                        </p>
                      )}
                      {!item.isAvailable && (
                        <span className="mt-1 inline-block text-xs font-semibold text-danger">
                          Unavailable
                        </span>
                      )}
                    </div>

                    <div className="flex w-24 shrink-0 flex-col items-center gap-1.5">
                      <FoodImage
                        src={item.imageUrl}
                        alt={item.name}
                        name={item.name}
                        className="h-20 w-24 rounded-xl"
                        emoji={item.isVeg ? "🥗" : "🍗"}
                      />
                      {simpleLine && !disabled ? (
                        <Stepper
                          size="sm"
                          value={simpleLine.qty}
                          onInc={() => cart.incQty(simpleLine.lineId)}
                          onDec={() => cart.decQty(simpleLine.lineId)}
                          className="-mt-4 bg-white shadow-sm"
                        />
                      ) : (
                        <button
                          disabled={disabled}
                          onClick={() => onAddItem(item)}
                          className={cn(
                            "-mt-4 h-8 rounded-xl border bg-white px-5 text-sm font-bold shadow-sm transition-colors disabled:opacity-50",
                            "border-accent-200 text-accent-600"
                          )}
                        >
                          {qty > 0 ? `ADD · ${qty}` : "ADD"}
                          {hasOptions && <span className="ml-0.5 text-accent-400">+</span>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Customization sheet */}
      {sheetItem && (
        <ItemCustomizationSheet
          item={sheetItem}
          open={!!sheetItem}
          onClose={() => setSheetItem(null)}
          onAdd={requestAdd}
        />
      )}

      {/* Single-vendor switch confirm */}
      <ConfirmDialog
        open={confirmSwitch}
        title="Start a new order?"
        message={`Your cart has items from ${cart.vendorName}. Adding this will clear it.`}
        confirmLabel="Clear & Add"
        destructive
        onCancel={() => {
          setConfirmSwitch(false);
          setPending(null);
        }}
        onConfirm={() => {
          cart.clear();
          if (pending) doAdd(pending);
          setPending(null);
          setConfirmSwitch(false);
        }}
      />
    </div>
  );
}

function BackBar() {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <Link
        href="/"
        aria-label="Back"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </Link>
    </div>
  );
}

function VendorPageSkeleton() {
  return (
    <div>
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-16 w-full rounded-xl" />
        {Array.from({ length: 4 }).map((_, i) => (
          <MenuItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
