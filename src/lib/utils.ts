// Vendor Open/Closed Logic
// Computes whether a vendor is currently open based on their schedule

interface OpenHoursEntry {
  open: string; // "HH:MM" format
  close: string; // "HH:MM" format
}

type OpenHoursMap = Record<string, OpenHoursEntry>;

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_INDEX_BY_NAME: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/** All operating schedules are interpreted in IIMA's local timezone. */
export const CAMPUS_TIME_ZONE = 'Asia/Kolkata';
const CAMPUS_UTC_OFFSET_MINUTES = 5 * 60 + 30;

const campusClockFormatter = new Intl.DateTimeFormat('en-US-u-ca-gregory', {
  timeZone: CAMPUS_TIME_ZONE,
  weekday: 'short',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

interface CampusClock {
  dayIndex: number;
  dayName: string;
  year: number;
  month: number;
  day: number;
  minutes: number;
}

function getCampusClock(date: Date): CampusClock {
  const parts = Object.fromEntries(
    campusClockFormatter
      .formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );
  const dayName = parts.weekday.toLowerCase();

  return {
    dayIndex: DAY_INDEX_BY_NAME[dayName],
    dayName,
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

/**
 * Parse an "HH:MM" string into total minutes since midnight.
 */
function parseTime(time: string): number | null {
  const match = /^(?:[01]\d|2[0-3]):[0-5]\d$/.exec(time);
  if (!match) return null;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function parseOpenHours(openHoursJson: string): OpenHoursMap | null {
  try {
    const parsed: unknown = JSON.parse(openHoursJson);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as OpenHoursMap;
  } catch {
    return null;
  }
}

function isWithinSameDayWindow(
  hours: OpenHoursEntry | undefined,
  nowMinutes: number
): boolean {
  if (!hours) return false;
  const openMinutes = parseTime(hours.open);
  const closeMinutes = parseTime(hours.close);
  if (openMinutes === null || closeMinutes === null) return false;

  // Equal times represent a 24-hour window for that scheduled day.
  if (openMinutes === closeMinutes) return true;
  if (closeMinutes < openMinutes) return nowMinutes >= openMinutes;
  return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
}

function carriesOverFromPreviousDay(
  hours: OpenHoursEntry | undefined,
  nowMinutes: number
): boolean {
  if (!hours) return false;
  const openMinutes = parseTime(hours.open);
  const closeMinutes = parseTime(hours.close);
  if (openMinutes === null || closeMinutes === null) return false;

  return closeMinutes < openMinutes && nowMinutes < closeMinutes;
}

/**
 * Check if a vendor is currently open based on their openHours JSON and isTemporarilyClosed flag.
 */
export function isVendorOpen(
  openHoursJson: string,
  isTemporarilyClosed: boolean,
  now = new Date()
): boolean {
  if (isTemporarilyClosed) return false;

  try {
    const openHours = parseOpenHours(openHoursJson);
    if (!openHours) return false;

    const campusClock = getCampusClock(now);
    const previousDayIndex = (campusClock.dayIndex + 6) % 7;

    return (
      isWithinSameDayWindow(openHours[campusClock.dayName], campusClock.minutes) ||
      carriesOverFromPreviousDay(
        openHours[DAY_NAMES[previousDayIndex]],
        campusClock.minutes
      )
    );
  } catch {
    return false;
  }
}

/**
 * Get the next opening time for a vendor (human-readable string).
 * Returns null if vendor has no schedule.
 */
export function getNextOpenTime(
  openHoursJson: string,
  now = new Date()
): string | null {
  try {
    const openHours = parseOpenHours(openHoursJson);
    if (!openHours) return null;
    const campusClock = getCampusClock(now);

    // Check today first (might open later today)
    const todayHours = openHours[campusClock.dayName];
    if (todayHours) {
      const openMins = parseTime(todayHours.open);
      if (openMins !== null && campusClock.minutes < openMins) {
        return `today at ${formatScheduleTime(todayHours.open)}`;
      }
    }

    // Check upcoming days
    for (let offset = 1; offset <= 7; offset++) {
      const dayIndex = (campusClock.dayIndex + offset) % 7;
      const dayName = DAY_NAMES[dayIndex];
      const dayHours = openHours[dayName];
      if (dayHours && parseTime(dayHours.open) !== null) {
        const dayLabel = offset === 1
          ? 'tomorrow'
          : dayName.charAt(0).toUpperCase() + dayName.slice(1);
        return `${dayLabel} at ${formatScheduleTime(dayHours.open)}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/** Safely parse stored operating hours for API responses. */
export function parseOpenHoursJson(openHoursJson: string): OpenHoursMap {
  return parseOpenHours(openHoursJson) ?? {};
}

/** Format a persisted 24-hour time for customer-facing status copy. */
export function formatScheduleTime(time: string): string {
  const minutes = parseTime(time);
  if (minutes === null) return time;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

/** Return the UTC bounds for one IIMA calendar day. */
export function getCampusDayRange(date: Date | string = new Date()): {
  start: Date;
  end: Date;
} {
  let year: number;
  let month: number;
  let day: number;

  if (typeof date === 'string') {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!match) throw new Error('Date must use YYYY-MM-DD format');
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
    const normalized = new Date(Date.UTC(year, month - 1, day));
    if (
      normalized.getUTCFullYear() !== year ||
      normalized.getUTCMonth() !== month - 1 ||
      normalized.getUTCDate() !== day
    ) {
      throw new Error('Date must be a valid calendar day');
    }
  } else {
    const campusClock = getCampusClock(date);
    ({ year, month, day } = campusClock);
  }

  const localMidnightAsUtc = Date.UTC(year, month - 1, day);
  const start = new Date(
    localMidnightAsUtc - CAMPUS_UTC_OFFSET_MINUTES * 60_000
  );
  const end = new Date(start.getTime() + 24 * 60 * 60_000);
  return { start, end };
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
