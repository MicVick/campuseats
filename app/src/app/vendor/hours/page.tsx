"use client";

import { useState } from "react";
import { useVendorProfile, useUpdateVendorProfile } from "@/hooks/useVendorApi";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export default function VendorHoursPage() {
  const { data: profile, isLoading } = useVendorProfile();
  const updateProfile = useUpdateVendorProfile();
  const toast = useToast();

  const [hours, setHours] = useState<Record<string, { open: string; close: string }>>({});
  const [tempClosed, setTempClosed] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize from server data
  if (profile && !initialized) {
    setHours(profile.openHours || {});
    setTempClosed(profile.isTemporarilyClosed);
    setInitialized(true);
  }

  const toggleDay = (day: string) => {
    setHours((h) => {
      const copy = { ...h };
      if (copy[day]) {
        delete copy[day];
      } else {
        copy[day] = { open: "09:00", close: "22:00" };
      }
      return copy;
    });
  };

  const updateTime = (day: string, field: "open" | "close", value: string) => {
    setHours((h) => ({
      ...h,
      [day]: { ...h[day], [field]: value },
    }));
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        openHours: hours,
        isTemporarilyClosed: tempClosed,
      });
      toast.success("Hours updated");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-6 lg:px-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-black text-ink">Operating Hours</h1>
      <p className="mt-1 text-sm text-ink-soft">Set your weekly schedule</p>

      {/* Temporarily closed toggle */}
      <div className="mt-6 flex items-center justify-between rounded-xl border-2 border-danger/30 bg-nonveg-soft px-4 py-4">
        <div>
          <p className="font-semibold text-ink">Temporarily Close Now</p>
          <p className="text-xs text-ink-soft">Your shop will appear as closed</p>
        </div>
        <button
          onClick={() => setTempClosed(!tempClosed)}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            tempClosed ? "bg-danger" : "bg-line"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
              tempClosed ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Weekly schedule */}
      <div className="mt-6 space-y-3">
        {DAYS.map((day) => {
          const isOpen = !!hours[day.key];
          return (
            <div key={day.key} className="flex items-center gap-3 rounded-xl bg-surface p-3 shadow-sm">
              <label className="flex items-center gap-3 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={isOpen}
                  onChange={() => toggleDay(day.key)}
                  className="h-4 w-4 rounded accent-accent-500"
                />
                <span className="text-sm font-semibold text-ink w-24">{day.label}</span>
              </label>
              {isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={hours[day.key]?.open || "09:00"}
                    onChange={(e) => updateTime(day.key, "open", e.target.value)}
                    className="rounded-lg border border-line bg-surface-muted px-2 py-1.5 text-sm"
                  />
                  <span className="text-ink-faint">—</span>
                  <input
                    type="time"
                    value={hours[day.key]?.close || "22:00"}
                    onChange={(e) => updateTime(day.key, "close", e.target.value)}
                    className="rounded-lg border border-line bg-surface-muted px-2 py-1.5 text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm text-ink-faint">Closed</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Save */}
      <div className="mt-6">
        <Button
          fullWidth
          size="lg"
          onClick={handleSave}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving…" : "Save Hours"}
        </Button>
      </div>
    </div>
  );
}
