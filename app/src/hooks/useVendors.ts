"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/api";
import type { VendorCard, VendorDetail } from "@/types";

export interface VendorFilters {
  veg?: boolean;
  openNow?: boolean;
  category?: string;
  sort?: "rating" | "prepTime" | "price";
  q?: string;
}

export function useVendors(filters: VendorFilters) {
  return useQuery({
    queryKey: ["vendors", filters],
    queryFn: () =>
      apiFetch<VendorCard[]>("/vendors", {
        query: {
          veg: filters.veg ? "true" : undefined,
          openNow: filters.openNow ? "true" : undefined,
          category: filters.category,
          sort: filters.sort,
          q: filters.q,
        },
      }),
  });
}

export function useVendor(id: string | undefined, vegOnly = false) {
  return useQuery({
    queryKey: ["vendor", id, vegOnly],
    enabled: !!id,
    queryFn: () =>
      apiFetch<VendorDetail>(`/vendors/${id}`, {
        // Note: we fetch the full menu and filter veg client-side so the
        // toggle is instant and doesn't drop categories on the server.
      }),
  });
}
