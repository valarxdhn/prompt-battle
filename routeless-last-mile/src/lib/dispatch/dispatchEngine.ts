import type {
  AppState,
  BusSearchResult,
  CrowdLevel,
  BusStatus,
} from '../../types';
import { routeMatcher, getScheduleStopTime } from './routeMatcher';
import { calculatePriority, tagBestOptions, TaggedBusSearchResult } from './priorityCalculator';
import {
  crowdLevelFromOccupancy,
  hhmmToTodayISO,
  addMinutesToTime,
} from '../../utils/helpers';

export interface SearchParams {
  originStopId: string;
  destinationStopId: string;
  preferredDepartureTime: string; // "HH:MM"
}

export interface SearchResponse {
  results: TaggedBusSearchResult[];
  unavailable: BusSearchResult[];
  hasResults: boolean;
  showAlternatives: boolean;
  totalMatchingRoutes: number;
}

export function searchBuses(
  state: AppState,
  params: SearchParams
): SearchResponse {
  const { originStopId, destinationStopId, preferredDepartureTime } = params;

  if (!originStopId || !destinationStopId) {
    return {
      results: [],
      unavailable: [],
      hasResults: false,
      showAlternatives: false,
      totalMatchingRoutes: 0,
    };
  }

  // 1. Identify routes that connect origin to destination
  const matchingRoutes = state.routes.filter((route) =>
    routeMatcher(route, originStopId, destinationStopId)
  );

  const availableResults: BusSearchResult[] = [];
  const unavailableResults: BusSearchResult[] = [];

  const boardingStopObj = state.stops.find((s) => s.id === originStopId);
  if (!boardingStopObj) {
    return {
      results: [],
      unavailable: [],
      hasResults: false,
      showAlternatives: true,
      totalMatchingRoutes: matchingRoutes.length,
    };
  }

  // 2. Scan schedules on those routes
  for (const route of matchingRoutes) {
    const schedules = state.schedules.filter((s) => s.routeId === route.id);

    for (const schedule of schedules) {
      const bus = state.buses.find((b) => b.id === schedule.busId);
      if (!bus) continue;

      const originDepTime =
        getScheduleStopTime(schedule, originStopId) || schedule.departureTime;
      const destArrTime =
        getScheduleStopTime(schedule, destinationStopId) || schedule.departureTime;

      // Adjust for reported delay
      const delayMin = bus.delayMinutes || 0;
      const effectiveDepartureTime =
        delayMin > 0 ? addMinutesToTime(originDepTime, delayMin) : originDepTime;

      const etaAtStop = hhmmToTodayISO(effectiveDepartureTime);
      const arrivalAtDestination = hhmmToTodayISO(
        delayMin > 0 ? addMinutesToTime(destArrTime, delayMin) : destArrTime
      );

      const crowdLevel: CrowdLevel = crowdLevelFromOccupancy(
        bus.currentOccupancy,
        bus.capacity
      );

      const searchResult: BusSearchResult = {
        bus,
        schedule,
        route,
        boardingStop: boardingStopObj,
        departureTime: effectiveDepartureTime,
        etaAtStop,
        arrivalAtDestination,
        status: bus.status,
        crowdLevel,
        dataType: bus.dataType,
      };

      // Determine if bus is operational
      const isUnavailable =
        bus.status === 'breakdown' ||
        bus.status === 'unavailable' ||
        bus.operationalStatus === 'out-of-service';

      if (isUnavailable) {
        unavailableResults.push(searchResult);
      } else {
        availableResults.push(searchResult);
      }
    }
  }

  // Sort available results by priority score relative to preferredDepartureTime
  availableResults.sort((a, b) => {
    const scoreA = calculatePriority(a, preferredDepartureTime);
    const scoreB = calculatePriority(b, preferredDepartureTime);
    return scoreB - scoreA;
  });

  const taggedResults = tagBestOptions(availableResults);

  // Trigger alternatives when:
  // - No results scheduled at all
  // - All available buses are full
  // - Only unavailable buses exist
  const allFull =
    availableResults.length > 0 &&
    availableResults.every((r) => r.bus.seatsAvailable === 0 || r.status === 'full');

  const showAlternatives =
    availableResults.length === 0 || allFull;

  return {
    results: taggedResults,
    unavailable: unavailableResults,
    hasResults: availableResults.length > 0 || unavailableResults.length > 0,
    showAlternatives,
    totalMatchingRoutes: matchingRoutes.length,
  };
}
