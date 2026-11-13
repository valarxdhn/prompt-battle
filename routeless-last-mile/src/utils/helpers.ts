import type { CrowdLevel, BusStatus, OperationalStatus } from '../types';

/**
 * Format an ISO timestamp or an "HH:MM" string to a human-readable time.
 * e.g. "07:30" → "7:30 AM"  |  "2024-05-01T07:30:00.000Z" → "7:30 AM"
 */
export function formatTime(isoOrHHMM: string): string {
  try {
    let date: Date;
    if (/^\d{2}:\d{2}$/.test(isoOrHHMM)) {
      // Plain HH:MM — treat as today in local time
      const [h, m] = isoOrHHMM.split(':').map(Number);
      date = new Date();
      date.setHours(h, m, 0, 0);
    } else {
      date = new Date(isoOrHHMM);
    }
    return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return isoOrHHMM;
  }
}

/**
 * Format an ISO timestamp to a readable date string.
 * e.g. "2024-05-01T07:30:00.000Z" → "1 May 2024"
 */
export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Returns how many minutes remain until the given ISO timestamp.
 * Negative if the time has already passed.
 */
export function minutesUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.round(diff / 60_000);
}

/**
 * Derive a CrowdLevel from current occupancy vs. capacity.
 */
export function crowdLevelFromOccupancy(occ: number, cap: number): CrowdLevel {
  if (cap <= 0) return 'empty';
  const ratio = occ / cap;
  if (ratio <= 0.1) return 'empty';
  if (ratio <= 0.5) return 'light';
  if (ratio <= 0.85) return 'moderate';
  return 'full';
}

/**
 * Derive a BusStatus from the bus's operational state, delay, and available seats.
 */
export function busStatusFromOperational(
  op: OperationalStatus,
  delayMin: number,
  seatsAvailable: number,
): BusStatus {
  if (op === 'out-of-service') return 'breakdown';
  if (op === 'stopped') return 'unavailable';
  if (seatsAvailable <= 0) return 'full';
  if (op === 'delayed' || delayMin > 0) return 'delayed';
  return 'on-time';
}

/**
 * Generate a random short alphanumeric id.
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Take an "HH:MM" string and an offset in minutes; return an ISO string for
 * today at that (HH:MM + minutes).
 */
export function addMinutesToTime(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + minutes, 0, 0);
  return date.toISOString();
}

/**
 * Convert an "HH:MM" string to an ISO string representing today at that time.
 */
export function hhmmToTodayISO(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toISOString();
}

/**
 * Calculate the ISO timestamp at which a reminder should fire, given the bus's
 * expected arrival ISO and how many minutes before that the user wants to be notified.
 */
export function getReminderTime(busArrivalISO: string, minutesBefore: number): string {
  const arrival = new Date(busArrivalISO).getTime();
  return new Date(arrival - minutesBefore * 60_000).toISOString();
}
