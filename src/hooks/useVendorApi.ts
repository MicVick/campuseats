"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/hooks/api";
import { useVendorAuthStore } from "@/stores/vendorAuthStore";

// ─── Dashboard ──────────────────────────────────────────────────

export interface DashboardSummary {
  totalOrders: number;
  placed: number;
  accepted: number;
  readyForPickup: number;
  completed: number;
  rejected: number;
  cancelled: number;
  totalRevenue: number;
}

export interface PopularItem {
  name: string;
  orderCount: number;
}

export function useVendorDashboard() {
  const token = useVendorAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["vendor-dashboard"],
    enabled: !!token,
    queryFn: () =>
      apiFetch<DashboardSummary>("/vendor/dashboard", { auth: "vendor" }),
    refetchInterval: 60_000,
  });
}

export function useVendorPopularItems() {
  const token = useVendorAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["vendor-popular-items"],
    enabled: !!token,
    queryFn: () =>
      apiFetch<PopularItem[]>("/vendor/dashboard", {
        auth: "vendor",
        query: { type: "popular-items" },
      }),
  });
}

// ─── Orders ─────────────────────────────────────────────────────

export interface VendorOrder {
  id: string;
  status: string;
  grandTotal: number;
  itemTotal: number;
  packagingFee: number;
  specialInstructions: string | null;
  estimatedPrepMins: number | null;
  placedAt: string;
  statusTimeline: { status: string; at: string }[];
  user: { name: string; email: string };
  items: {
    id: string;
    nameSnapshot: string;
    qty: number;
    unitPrice: number;
    selectedOptions: { name: string; priceDelta: number }[];
    itemNote: string | null;
  }[];
}

export function useVendorOrders(status?: string) {
  const token = useVendorAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["vendor-orders", status],
    enabled: !!token,
    queryFn: () =>
      apiFetch<VendorOrder[]>("/vendor/orders", {
        auth: "vendor",
        query: { status: status || undefined },
      }),
    refetchInterval: 15_000,
  });
}

export function useVendorOrderAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      action,
      reason,
    }: {
      orderId: string;
      action: "accept" | "reject" | "preparing" | "ready" | "complete";
      reason?: string;
    }) =>
      apiFetch(`/vendor/orders/${orderId}/${action}`, {
        method: "POST",
        auth: "vendor",
        body: reason ? { reason } : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-orders"] });
      qc.invalidateQueries({ queryKey: ["vendor-dashboard"] });
    },
  });
}

// ─── Menu ───────────────────────────────────────────────────────

export interface VendorMenuCategory {
  id: string;
  vendorId: string;
  name: string;
  sortOrder: number;
  items: VendorMenuItem[];
}

export interface VendorMenuItem {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  customizationGroups: {
    id: string;
    name: string;
    type: "single" | "multi";
    required: boolean;
    minSelect: number;
    maxSelect: number;
    options: { id: string; name: string; priceDelta: number }[];
  }[];
}

export function useVendorMenu() {
  const token = useVendorAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["vendor-menu"],
    enabled: !!token,
    queryFn: () =>
      apiFetch<VendorMenuCategory[]>("/vendor/menu", { auth: "vendor" }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; sortOrder?: number }) =>
      apiFetch("/vendor/categories", {
        method: "POST",
        auth: "vendor",
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-menu"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; sortOrder?: number }) =>
      apiFetch(`/vendor/categories/${id}`, {
        method: "PATCH",
        auth: "vendor",
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-menu"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/vendor/categories/${id}`, {
        method: "DELETE",
        auth: "vendor",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-menu"] }),
  });
}

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      categoryId: string;
      name: string;
      description?: string;
      price: number;
      isVeg: boolean;
      imageUrl?: string;
    }) =>
      apiFetch("/vendor/items", {
        method: "POST",
        auth: "vendor",
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-menu"] }),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      name?: string;
      description?: string | null;
      price?: number;
      isVeg?: boolean;
      isAvailable?: boolean;
      categoryId?: string;
      imageUrl?: string | null;
    }) =>
      apiFetch(`/vendor/items/${id}`, {
        method: "PATCH",
        auth: "vendor",
        body,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-menu"] }),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/vendor/items/${id}`, {
        method: "DELETE",
        auth: "vendor",
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-menu"] }),
  });
}

export function useToggleAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      apiFetch(`/vendor/items/${id}/availability`, {
        method: "PATCH",
        auth: "vendor",
        body: { isAvailable },
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendor-menu"] }),
  });
}

// ─── Profile ────────────────────────────────────────────────────

export interface VendorProfile {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  cuisineTags: string[];
  area: string;
  hasVeg: boolean;
  hasNonVeg: boolean;
  avgRating: number;
  ratingCount: number;
  mvrcRating: number | null;
  minOrder: number;
  packagingFee: number;
  avgPrepTimeMins: number;
  upiId: string | null;
  upiQrImageUrl: string | null;
  isTemporarilyClosed: boolean;
  openHours: Record<string, { open: string; close: string }>;
}

export function useVendorProfile() {
  const token = useVendorAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["vendor-profile"],
    enabled: !!token,
    queryFn: () =>
      apiFetch<VendorProfile>("/vendor/profile", { auth: "vendor" }),
  });
}

export function useUpdateVendorProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<VendorProfile>) =>
      apiFetch("/vendor/profile", {
        method: "PATCH",
        auth: "vendor",
        body,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendor-profile"] });
      qc.invalidateQueries({ queryKey: ["vendors"] });
      qc.invalidateQueries({ queryKey: ["vendor"] });
    },
  });
}

export function useChangeVendorPassword() {
  return useMutation({
    mutationFn: (body: { oldPassword: string; newPassword: string }) =>
      apiFetch("/vendor/auth/change-password", {
        method: "POST",
        auth: "vendor",
        body,
      }),
  });
}

// ─── Reviews & Feedback ─────────────────────────────────────────

export interface VendorReview {
  id: string;
  orderId: string;
  rating: number;
  text: string | null;
  createdAt: string;
  user: { name: string };
}

export interface VendorFeedback {
  id: string;
  orderId: string | null;
  foodQuality: number;
  hygiene: number;
  valueForMoney: number;
  itemComments: string | null;
  comments: string | null;
  isFlaggedForMvrc: boolean;
  createdAt: string;
  user: { name: string };
}

export function useVendorReviews() {
  const token = useVendorAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["vendor-reviews"],
    enabled: !!token,
    queryFn: () =>
      apiFetch<VendorReview[]>("/vendor/reviews", { auth: "vendor" }),
  });
}

export function useVendorFeedbackList() {
  const token = useVendorAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["vendor-feedback"],
    enabled: !!token,
    queryFn: () =>
      apiFetch<VendorFeedback[]>("/vendor/reviews", {
        auth: "vendor",
        query: { type: "feedback" },
      }),
  });
}
