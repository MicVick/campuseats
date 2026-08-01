"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVendorProfile, useUpdateVendorProfile } from "@/hooks/useVendorApi";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { CAMPUS_TIME_ZONE, isVendorOpen } from "@/lib/utils";
import { cn } from "@/utils/format";
import type { VendorProfile } from "@/hooks/useVendorApi";

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
] as const;

type Hours = Record<string, { open: string; close: string }>;

export default function VendorHoursPage() {
  const { data: profile, isLoading, isError, refetch } = useVendorProfile();

  if (isLoading) return <HoursSkeleton />;

  if (isError || !profile) {
    return (
      <div className="px-4 py-6 lg:px-8">
        <ErrorState
          message="Couldn't load your operating hours."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return <HoursForm profile={profile} />;
}

function HoursForm({ profile }: { profile: VendorProfile }) {
  const updateProfile = useUpdateVendorProfile();
  const toast = useToast();
  const scheduleRef = useRef<HTMLDivElement>(null);
  const [hours, setHours] = useState<Hours>(profile.openHours ?? {});
  const [savedHours, setSavedHours] = useState<Hours>(profile.openHours ?? {});
  const [tempClosed, setTempClosed] = useState(profile.isTemporarilyClosed);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const scheduledOpen = useMemo(
    () => isVendorOpen(JSON.stringify(hours), false, new Date(currentTime)),
    [currentTime, hours]
  );
  const isOpen = scheduledOpen && !tempClosed;
  const hasScheduleChanges = JSON.stringify(hours) !== JSON.stringify(savedHours);

  const toggleDay = (day: string) => {
    setHours((current) => {
      const next = { ...current };
      if (next[day]) {
        delete next[day];
      } else {
        next[day] = { open: "09:00", close: "22:00" };
      }
      return next;
    });
  };

  const updateTime = (day: string, field: "open" | "close", value: string) => {
    setHours((current) => ({
      ...current,
      [day]: { ...current[day], [field]: value },
    }));
  };

  const handleAvailabilityChange = async (shouldClose: boolean) => {
    try {
      await updateProfile.mutateAsync({ isTemporarilyClosed: shouldClose });
      setTempClosed(shouldClose);
      if (shouldClose) {
        toast.success("Shop temporarily closed");
      } else if (scheduledOpen) {
        toast.success("Shop is open now");
      } else {
        toast.success("Temporary closure removed; scheduled hours still apply");
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ openHours: hours });
      setSavedHours(hours);
      toast.success("Operating hours updated");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to save hours");
    }
  };

  const statusLabel = tempClosed
    ? "Temporarily closed"
    : isOpen
      ? "Open now"
      : "Closed by schedule";

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-8">
      <h1 className="text-2xl font-black text-ink">Operating Hours</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Control today&apos;s availability or update your weekly schedule.
      </p>

      <section
        className={cn(
          "mt-6 overflow-hidden rounded-2xl border bg-surface shadow-sm",
          tempClosed
            ? "border-danger/30"
            : isOpen
              ? "border-veg/30"
              : "border-line"
        )}
      >
        <div
          className={cn(
            "flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between",
            tempClosed ? "bg-nonveg-soft/50" : isOpen ? "bg-veg-soft/60" : "bg-surface"
          )}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-faint">
              Current status
            </p>
            <p
              className={cn(
                "mt-1 flex items-center gap-2 text-xl font-black",
                tempClosed ? "text-danger" : isOpen ? "text-veg" : "text-ink"
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full",
                  tempClosed ? "bg-danger" : isOpen ? "bg-veg" : "bg-ink-faint"
                )}
              />
              {statusLabel}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              {tempClosed
                ? "New orders are paused until you reopen."
                : isOpen
                  ? "Students can browse and place orders."
                  : "Students can browse, but ordering resumes at the next opening time."}
            </p>
          </div>

          {tempClosed ? (
            <Button
              variant={scheduledOpen ? "veg" : "secondary"}
              onClick={() => handleAvailabilityChange(false)}
              loading={updateProfile.isPending}
              className="shrink-0"
            >
              {scheduledOpen ? "Open now" : "Resume scheduled hours"}
            </Button>
          ) : isOpen ? (
            <Button
              variant="danger"
              onClick={() => handleAvailabilityChange(true)}
              loading={updateProfile.isPending}
              className="shrink-0"
            >
              Temporarily close now
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() =>
                scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="shrink-0"
            >
              Change operating hours
            </Button>
          )}
        </div>
        <div className="border-t border-line px-5 py-3 text-xs text-ink-soft">
          Temporary closure takes effect immediately. Weekly hours use India Standard Time.
        </div>
      </section>

      <section ref={scheduleRef} className="mt-8 scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-ink">Weekly schedule</h2>
            <p className="mt-0.5 text-xs text-ink-soft">
              Closing times earlier than opening times run into the next day.
            </p>
          </div>
          <span className="rounded-pill bg-surface px-3 py-1 text-xs font-semibold text-ink-soft ring-1 ring-line">
            {CAMPUS_TIME_ZONE.replace("Asia/", "")} · IST
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {DAYS.map((day) => {
            const dayIsOpen = Boolean(hours[day.key]);
            return (
              <div
                key={day.key}
                className="rounded-xl border border-line bg-surface p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{day.label}</p>
                    <p className="text-xs text-ink-faint">
                      {dayIsOpen ? "Accepting orders" : "Closed all day"}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={dayIsOpen}
                    aria-label={`${dayIsOpen ? "Close" : "Open"} on ${day.label}`}
                    onClick={() => toggleDay(day.key)}
                    className={cn(
                      "relative h-7 w-12 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-300 focus:ring-offset-2",
                      dayIsOpen ? "bg-accent-500" : "bg-line"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
                        dayIsOpen ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>

                {dayIsOpen && (
                  <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2 border-t border-line pt-4">
                    <TimeField
                      label="Opens"
                      value={hours[day.key]?.open ?? "09:00"}
                      onChange={(value) => updateTime(day.key, "open", value)}
                    />
                    <span className="pb-2.5 text-sm text-ink-faint">to</span>
                    <TimeField
                      label="Closes"
                      value={hours[day.key]?.close ?? "22:00"}
                      onChange={(value) => updateTime(day.key, "close", value)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-20 mt-6 rounded-2xl border border-line bg-surface/95 p-3 shadow-lg backdrop-blur lg:bottom-4">
        <Button
          fullWidth
          size="lg"
          onClick={handleSave}
          loading={updateProfile.isPending}
          disabled={!hasScheduleChanges}
        >
          {hasScheduleChanges ? "Save operating hours" : "Operating hours saved"}
        </Button>
      </div>
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="min-w-0">
      <span className="mb-1 block text-xs font-semibold text-ink-soft">{label}</span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full min-w-0 rounded-lg border border-line bg-surface-muted px-2 text-sm text-ink focus:border-accent-400 focus:outline-none"
      />
    </label>
  );
}

function HoursSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 lg:px-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-36 rounded-2xl" />
      {Array.from({ length: 7 }).map((_, index) => (
        <Skeleton key={index} className="h-20 rounded-xl" />
      ))}
    </div>
  );
}
