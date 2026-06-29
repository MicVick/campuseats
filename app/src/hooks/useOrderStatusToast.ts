"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/Toast";
import { ORDER_STATUS_LABEL } from "@/utils/format";
import type { OrderStatus } from "@/types";

/**
 * Hook to show a toast notification when an order's status changes.
 */
export function useOrderStatusToast(status: OrderStatus | undefined) {
  const prevStatusRef = useRef<OrderStatus | undefined>(undefined);
  const toast = useToast();

  useEffect(() => {
    if (prevStatusRef.current === undefined) {
      prevStatusRef.current = status;
      return;
    }

    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (status && prev && status !== prev) {
      const label = ORDER_STATUS_LABEL[status] || status;
      
      if (status === "ready_for_pickup") {
        toast.success(`Your order is ${label}!`);
      } else if (status === "cancelled" || status === "rejected") {
        toast.error(`Order was ${label.toLowerCase()}`);
      } else {
        toast.success(`Order is now: ${label}`);
      }
    }
  }, [status, toast]);
}
