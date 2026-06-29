// Vendor Open/Closed Logic
// Computes whether a vendor is currently open based on their schedule

interface OpenHoursEntry {
  open: string; // "HH:MM" format
  close: string; // "HH:MM" format
}

type OpenHoursMap = Record<string, OpenHoursEntry>;

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * Parse an "HH:MM" string into total minutes since midnight.
 */
function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Check if a vendor is currently open based on their openHours JSON and isTemporarilyClosed flag.
 */
export function isVendorOpen(
  openHoursJson: string,
  isTemporarilyClosed: boolean
): boolean {
  if (isTemporarilyClosed) return false;

  try {
    const openHours: OpenHoursMap = JSON.parse(openHoursJson);
    const now = new Date();
    const dayName = DAY_NAMES[now.getDay()];
    const todayHours = openHours[dayName];

    if (!todayHours) return false;

    const nowMins = now.getHours() * 60 + now.getMinutes();
    const openMins = parseTime(todayHours.open);
    const closeMins = parseTime(todayHours.close);

    // Handle overnight hours (e.g., open 22:00, close 03:00)
    if (closeMins <= openMins) {
      return nowMins >= openMins || nowMins < closeMins;
    }

    return nowMins >= openMins && nowMins < closeMins;
  } catch {
    return false;
  }
}

/**
 * Get the next opening time for a vendor (human-readable string).
 * Returns null if vendor has no schedule.
 */
export function getNextOpenTime(openHoursJson: string): string | null {
  try {
    const openHours: OpenHoursMap = JSON.parse(openHoursJson);
    const now = new Date();
    const currentDay = now.getDay();
    const nowMins = now.getHours() * 60 + now.getMinutes();

    // Check today first (might open later today)
    const todayName = DAY_NAMES[currentDay];
    const todayHours = openHours[todayName];
    if (todayHours) {
      const openMins = parseTime(todayHours.open);
      if (nowMins < openMins) {
        return `Today at ${todayHours.open}`;
      }
    }

    // Check upcoming days
    for (let offset = 1; offset <= 7; offset++) {
      const dayIndex = (currentDay + offset) % 7;
      const dayName = DAY_NAMES[dayIndex];
      const dayHours = openHours[dayName];
      if (dayHours) {
        const dayLabel = offset === 1 ? 'Tomorrow' : dayName.charAt(0).toUpperCase() + dayName.slice(1);
        return `${dayLabel} at ${dayHours.open}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Parse the JSON cuisineTags string into an array.
 */
export function parseCuisineTags(tagsJson: string): string[] {
  try {
    return JSON.parse(tagsJson);
  } catch {
    return [];
  }
}

/**
 * Parse the JSON statusTimeline string into a typed array.
 */
export interface StatusTimelineEntry {
  status: string;
  at: string;
}

export function parseStatusTimeline(timelineJson: string): StatusTimelineEntry[] {
  try {
    return JSON.parse(timelineJson);
  } catch {
    return [];
  }
}

/**
 * Add a new entry to the status timeline JSON string.
 */
export function addStatusToTimeline(
  currentTimelineJson: string,
  status: string
): string {
  const timeline = parseStatusTimeline(currentTimelineJson);
  timeline.push({ status, at: new Date().toISOString() });
  return JSON.stringify(timeline);
}
