"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PrefsState {
  vegOnly: boolean;
  setVegOnly: (v: boolean) => void;
  toggleVegOnly: () => void;
}

/** Global UI preferences. `vegOnly` syncs the veg filter across Home,
 *  Search, and Vendor pages per the PRD. */
export const usePrefsStore = create<PrefsState>()(
  persist(
    (set) => ({
      vegOnly: false,
      setVegOnly: (v) => set({ vegOnly: v }),
      toggleVegOnly: () => set((s) => ({ vegOnly: !s.vegOnly })),
    }),
    { name: "campuseats-prefs" }
  )
);
