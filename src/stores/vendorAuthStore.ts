"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface VendorIdentity {
  id: string;
  name: string;
  email: string;
}

interface VendorAuthState {
  token: string | null;
  vendor: VendorIdentity | null;
  hydrated: boolean;
  login: (token: string, vendor: VendorIdentity) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useVendorAuthStore = create<VendorAuthState>()(
  persist(
    (set) => ({
      token: null,
      vendor: null,
      hydrated: false,
      login: (token, vendor) => set({ token, vendor }),
      logout: () => set({ token: null, vendor: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "campuseats-vendor-auth",
      partialize: (s) => ({ token: s.token, vendor: s.vendor }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

/** Read the current vendor token outside React (used by the API fetcher). */
export function getVendorToken(): string | null {
  return useVendorAuthStore.getState().token;
}
