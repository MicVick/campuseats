"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/api";
import { useAuthStore } from "@/stores/authStore";
import type { Order } from "@/types";

// ─── Queries ────────────────────────────────────────────────────

export function useOrders() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["orders"],
    enabled: !!token,
    queryFn: () => apiFetch<Order[]>("/orders", { auth: "student" }),
  });
}

export function useOrder(id: string | undefined) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["order", id],
    enabled: !!token && !!id,
    queryFn: () => apiFetch<Order>(`/orders/${id}`, { auth: "student" }),
    refetchInterval: 20_000, // auto-poll every 20s for status updates
  });
}

// ─── Mutations ──────────────────────────────────────────────────

interface PlaceOrderPayload {
  vendorId: string;
  items: {
    menuItemId: string;
    qty: number;
    selectedOptions: { name: string; priceDelta: number }[];
    itemNote?: string;
  }[];
  specialInstructions?: string;
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PlaceOrderPayload) =>
      apiFetch<Order>("/orders", {
        method: "POST",
        auth: "student",
        body: payload,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      apiFetch(`/orders/${orderId}/cancel`, {
        method: "POST",
        auth: "student",
      }),
    onSuccess: (_data, orderId) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", orderId] });
    },
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      rating,
      text,
    }: {
      orderId: string;
      rating: number;
      text?: string;
    }) =>
      apiFetch(`/orders/${orderId}/review`, {
        method: "POST",
        auth: "student",
        body: { rating, text },
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
    },
  });
}

export function useSubmitFeedback() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      ...body
    }: {
      orderId: string;
      foodQuality: number;
      hygiene: number;
      valueForMoney: number;
      itemComments?: string;
      comments?: string;
      flagForMvrc?: boolean;
    }) =>
      apiFetch(`/orders/${orderId}/feedback`, {
        method: "POST",
        auth: "student",
        body,
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["order", vars.orderId] });
    },
  });
}
