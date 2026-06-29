"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SelectedOption } from "@/types";

export interface CartLine {
  lineId: string;
  menuItemId: string;
  name: string;
  basePrice: number; // paise, before options
  qty: number;
  selectedOptions: SelectedOption[];
  itemNote?: string;
  isVeg: boolean;
}

interface CartState {
  vendorId: string | null;
  vendorName: string | null;
  packagingFee: number;
  minOrder: number;
  lines: CartLine[];
  hydrated: boolean;

  isDifferentVendor: (vendorId: string) => boolean;
  addItem: (
    vendor: { id: string; name: string; packagingFee: number; minOrder: number },
    line: Omit<CartLine, "lineId" | "qty"> & { qty?: number }
  ) => void;
  updateLine: (lineId: string, patch: Partial<Omit<CartLine, "lineId">>) => void;
  incQty: (lineId: string) => void;
  decQty: (lineId: string) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  setHydrated: () => void;
}

function signature(
  menuItemId: string,
  options: SelectedOption[],
  note?: string
): string {
  const opts = [...options]
    .map((o) => o.name)
    .sort()
    .join("|");
  return `${menuItemId}::${opts}::${note?.trim() ?? ""}`;
}

export const lineUnitPrice = (line: CartLine): number =>
  line.basePrice + line.selectedOptions.reduce((s, o) => s + o.priceDelta, 0);

export const lineTotal = (line: CartLine): number =>
  lineUnitPrice(line) * line.qty;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      vendorId: null,
      vendorName: null,
      packagingFee: 0,
      minOrder: 0,
      lines: [],
      hydrated: false,

      isDifferentVendor: (vendorId) => {
        const s = get();
        return s.lines.length > 0 && s.vendorId !== vendorId;
      },

      addItem: (vendor, line) => {
        set((state) => {
          // Switching vendors wipes the cart (caller confirms first).
          const sameVendor = state.vendorId === vendor.id;
          const baseLines = sameVendor ? state.lines : [];
          const sig = signature(line.menuItemId, line.selectedOptions, line.itemNote);
          const qty = line.qty ?? 1;

          const existing = baseLines.find(
            (l) =>
              signature(l.menuItemId, l.selectedOptions, l.itemNote) === sig
          );

          let lines: CartLine[];
          if (existing) {
            lines = baseLines.map((l) =>
              l.lineId === existing.lineId ? { ...l, qty: l.qty + qty } : l
            );
          } else {
            lines = [
              ...baseLines,
              {
                ...line,
                qty,
                lineId: `${sig}::${Date.now()}::${Math.random()
                  .toString(36)
                  .slice(2, 6)}`,
              },
            ];
          }

          return {
            vendorId: vendor.id,
            vendorName: vendor.name,
            packagingFee: vendor.packagingFee,
            minOrder: vendor.minOrder,
            lines,
          };
        });
      },

      updateLine: (lineId, patch) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.lineId === lineId ? { ...l, ...patch } : l
          ),
        })),

      incQty: (lineId) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.lineId === lineId ? { ...l, qty: l.qty + 1 } : l
          ),
        })),

      decQty: (lineId) =>
        set((state) => {
          const lines = state.lines
            .map((l) => (l.lineId === lineId ? { ...l, qty: l.qty - 1 } : l))
            .filter((l) => l.qty > 0);
          if (lines.length === 0) {
            return { lines, vendorId: null, vendorName: null };
          }
          return { lines };
        }),

      removeLine: (lineId) =>
        set((state) => {
          const lines = state.lines.filter((l) => l.lineId !== lineId);
          if (lines.length === 0) {
            return { lines, vendorId: null, vendorName: null };
          }
          return { lines };
        }),

      clear: () =>
        set({ lines: [], vendorId: null, vendorName: null, packagingFee: 0, minOrder: 0 }),

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "campuseats-cart",
      partialize: (s) => ({
        vendorId: s.vendorId,
        vendorName: s.vendorName,
        packagingFee: s.packagingFee,
        minOrder: s.minOrder,
        lines: s.lines,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

// ─── Derived selectors (use outside or inside components) ──────────

export const cartCount = (lines: CartLine[]): number =>
  lines.reduce((s, l) => s + l.qty, 0);

export const cartItemTotal = (lines: CartLine[]): number =>
  lines.reduce((s, l) => s + lineTotal(l), 0);
