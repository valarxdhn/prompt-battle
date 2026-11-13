import type { Route, Schedule } from '../../types';

/**
 * Checks if a route contains both origin and destination stops in valid forward order.
 */
export function routeMatcher(
  route: Route,
  originStopId: string,
  destinationStopId: string
): boolean {
  if (!route || !route.stops || route.stops.length < 2) return false;

  const originIndex = route.stops.findIndex((s) => s.id === originStopId);
  const destIndex = route.stops.findIndex((s) => s.id === destinationStopId);

  if (originIndex === -1 || destIndex === -1) return false;

  // Origin must come before destination in sequence
  return originIndex < destIndex;
}

/**
 * Returns all stop IDs between origin and destination (inclusive) along the route.
 */
export function getStopsInRoute(
  route: Route,
  originStopId: string,
  destinationStopId: string
): string[] {
  const originIndex = route.stops.findIndex((s) => s.id === originStopId);
  const destIndex = route.stops.findIndex((s) => s.id === destinationStopId);

  if (originIndex === -1 || destIndex === -1 || originIndex >= destIndex) {
    return [];
  }

  return route.stops.slice(originIndex, destIndex + 1).map((s) => s.id);
}

/**
 * Returns the HH:MM arrival time for a specific stop from a schedule.
 */
export function getScheduleStopTime(
  schedule: Schedule,
  stopId: string
): string | null {
  const stopEntry = schedule.stops.find((s) => s.stopId === stopId);
  return stopEntry ? stopEntry.arrivalTime : null;
}
