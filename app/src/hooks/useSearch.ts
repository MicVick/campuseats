"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/api";
import type { SearchResults } from "@/types";

export function useSearch(q: string, veg: boolean) {
  const trimmed = q.trim();
  return useQuery({
    queryKey: ["search", trimmed, veg],
    enabled: trimmed.length > 0,
    queryFn: () =>
      apiFetch<SearchResults>("/search", {
        query: { q: trimmed, veg: veg ? "true" : undefined },
      }),
  });
}
