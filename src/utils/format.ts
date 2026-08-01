// Formatting helpers. Money is stored in paise (integer).

import { CAMPUS_TIME_ZONE } from "@/lib/utils";

/** Format paise as ₹ amount. 6000 → "₹60". Shows decimals only when needed. */
export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  const rounded = Math.round(rupees * 100) / 100;
  const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
  return `₹${str}`;
}

/** Relative time like "2 min ago", "just now", "3 hr ago". */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/** Friendly date+time, e.g. "28 Jun, 6:00 PM". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Just the time, e.g. "6:10 PM". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Human label for an order status. */
export const ORDER_STATUS_LABEL: Record<string, string> = {
  placed: "Placed",
  accepted: "Accepted",
  preparing: "Preparing",
  ready_for_pickup: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_INDEX_BY_NAME: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/** Today's open/close window as a label, e.g. "7:30 AM – 10:00 PM" or "Closed today". */
export function todayHoursLabel(
  openHours: Record<string, { open: string; close: string }>
): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: CAMPUS_TIME_ZONE,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  const dayName = parts.weekday.toLowerCase();
  const dayIndex = DAY_INDEX_BY_NAME[dayName];
  const nowMinutes = Number(parts.hour) * 60 + Number(parts.minute);
  const previousDay = openHours[DAY_KEYS[(dayIndex + 6) % 7]];

  if (previousDay) {
    const previousOpen = timeToMinutes(previousDay.open);
    const previousClose = timeToMinutes(previousDay.close);
    if (
      previousOpen !== null &&
      previousClose !== null &&
      previousClose < previousOpen &&
      nowMinutes < previousClose
    ) {
      return `${to12h(previousDay.open)} – ${to12h(previousDay.close)}`;
    }
  }

  const today = openHours[DAY_KEYS[dayIndex]];
  if (!today) return "Closed today";
  return `${to12h(today.open)} – ${to12h(today.close)}`;
}

function timeToMinutes(hhmm: string): number | null {
  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hhmm)) return null;
  const [hour, minute] = hhmm.split(":").map(Number);
  return hour * 60 + minute;
}

function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** className concatenation helper. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
