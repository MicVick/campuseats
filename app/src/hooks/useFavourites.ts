"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/api";
import { useAuthStore } from "@/stores/authStore";
import type { VendorCardLike } from "@/types";

export function useFavourites() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["favourites"],
    enabled: !!token,
    queryFn: () => apiFetch<VendorCardLike[]>("/favourites", { auth: "student" }),
  });
}

/** Set of favourited vendor IDs for quick heart state on cards. */
export function useFavouriteIds(): Set<string> {
  const { data } = useFavourites();
  return new Set((data ?? []).map((v) => v.id));
}

export function useToggleFavourite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      vendorId,
      isFav,
    }: {
      vendorId: string;
      isFav: boolean;
    }) =>
      isFav
        ? apiFetch(`/favourites`, {
            method: "DELETE",
            auth: "student",
            query: { vendorId },
          })
        : apiFetch(`/favourites`, {
            method: "POST",
            auth: "student",
            body: { vendorId },
          }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favourites"] });
    },
  });
}
