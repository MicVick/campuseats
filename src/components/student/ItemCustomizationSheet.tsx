"use client";

import { useMemo, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Stepper } from "@/components/ui/Stepper";
import { VegDot } from "@/components/ui/Badge";
import { formatPrice, cn } from "@/utils/format";
import type { MenuItem, SelectedOption } from "@/types";

export interface PendingLine {
  menuItemId: string;
  name: string;
  basePrice: number;
  isVeg: boolean;
  qty: number;
  selectedOptions: SelectedOption[];
  itemNote?: string;
}

/** Bottom sheet for choosing required/optional modifiers before adding to cart.
 *  Supports single-select (radio) and multi-select (checkbox) groups with
 *  min/max + required rules, live price, item note, and quantity. */
export function ItemCustomizationSheet({
  item,
  open,
  onClose,
  onAdd,
  initial,
}: {
  item: MenuItem;
  open: boolean;
  onClose: () => void;
  onAdd: (line: PendingLine) => void;
  initial?: { selectedOptions: SelectedOption[]; itemNote?: string; qty?: number };
}) {
  // selected[groupId] = set of option ids
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    if (!initial) return {};
    const map: Record<string, string[]> = {};
    for (const g of item.customizationGroups) {
      const ids = g.options
        .filter((o) =>
          initial.selectedOptions.some((s) =>
            s.id ? s.id === o.id : s.name === o.name
          )
        )
        .map((o) => o.id);
      if (ids.length) map[g.id] = ids;
    }
    return map;
  });
  const [note, setNote] = useState(initial?.itemNote ?? "");
  const [qty, setQty] = useState(initial?.qty ?? 1);
  const [showErrors, setShowErrors] = useState(false);

  const toggleOption = (
    groupId: string,
    optionId: string,
    type: "single" | "multi",
    maxSelect: number
  ) => {
    setSelected((prev) => {
      const cur = prev[groupId] ?? [];
      if (type === "single") {
        return { ...prev, [groupId]: [optionId] };
      }
      if (cur.includes(optionId)) {
        return { ...prev, [groupId]: cur.filter((id) => id !== optionId) };
      }
      if (cur.length >= maxSelect) return prev; // max reached
      return { ...prev, [groupId]: [...cur, optionId] };
    });
  };

  const selectedOptions: SelectedOption[] = useMemo(() => {
    const out: SelectedOption[] = [];
    for (const g of item.customizationGroups) {
      const ids = selected[g.id] ?? [];
      for (const o of g.options) {
        if (ids.includes(o.id)) {
          out.push({ id: o.id, name: o.name, priceDelta: o.priceDelta });
        }
      }
    }
    return out;
  }, [selected, item.customizationGroups]);

  const unitPrice =
    item.price + selectedOptions.reduce((s, o) => s + o.priceDelta, 0);
  const total = unitPrice * qty;

  const unmetGroups = item.customizationGroups.filter((g) => {
    const count = (selected[g.id] ?? []).length;
    if (g.required && count < Math.max(1, g.minSelect)) return true;
    if (g.minSelect > 0 && count < g.minSelect) return true;
    return false;
  });

  const handleAdd = () => {
    if (unmetGroups.length > 0) {
      setShowErrors(true);
      return;
    }
    onAdd({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      isVeg: item.isVeg,
      qty,
      selectedOptions,
      itemNote: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={item.name}
      footer={
        <div className="flex items-center gap-3">
          <Stepper
            value={qty}
            onInc={() => setQty((q) => q + 1)}
            onDec={() => setQty((q) => Math.max(1, q - 1))}
          />
          <button
            onClick={handleAdd}
            className="h-11 flex-1 rounded-xl bg-accent-500 px-4 text-sm font-bold text-white active:scale-[0.98]"
          >
            Add — {formatPrice(total)}
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-2 pb-2">
        <VegDot isVeg={item.isVeg} />
        <span className="text-sm font-semibold text-ink">
          {formatPrice(item.price)}
        </span>
      </div>
      {item.description && (
        <p className="pb-3 text-sm text-ink-soft">{item.description}</p>
      )}

      <div className="space-y-5">
        {item.customizationGroups.map((g) => {
          const ids = selected[g.id] ?? [];
          const unmet = showErrors && unmetGroups.includes(g);
          return (
            <div key={g.id}>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-ink">{g.name}</h4>
                  <p className="text-xs text-ink-faint">
                    {g.required ? "Required · " : ""}
                    {g.type === "multi"
                      ? `Choose up to ${g.maxSelect}`
                      : "Choose one"}
                  </p>
                </div>
                {unmet && (
                  <span className="text-xs font-semibold text-danger">
                    Required
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "divide-y divide-line overflow-hidden rounded-xl border",
                  unmet ? "border-danger" : "border-line"
                )}
              >
                {g.options.map((o) => {
                  const checked = ids.includes(o.id);
                  const atMax =
                    g.type === "multi" && !checked && ids.length >= g.maxSelect;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      disabled={atMax}
                      onClick={() =>
                        toggleOption(g.id, o.id, g.type, g.maxSelect)
                      }
                      className={cn(
                        "flex w-full items-center justify-between px-3.5 py-3 text-left text-sm disabled:opacity-40",
                        checked ? "bg-accent-50" : "bg-white"
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "flex h-5 w-5 items-center justify-center border-2 text-[11px] text-white",
                            g.type === "single" ? "rounded-full" : "rounded-md",
                            checked
                              ? "border-accent-500 bg-accent-500"
                              : "border-line bg-white"
                          )}
                        >
                          {checked && "✓"}
                        </span>
                        <span className="font-medium text-ink">{o.name}</span>
                      </span>
                      {o.priceDelta !== 0 && (
                        <span className="text-ink-soft">
                          +{formatPrice(o.priceDelta)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div>
          <label className="mb-1.5 block text-sm font-bold text-ink">
            Add a note <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="e.g. less spicy, no onion"
            className="w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-accent-500"
          />
        </div>
      </div>
    </Sheet>
  );
}
