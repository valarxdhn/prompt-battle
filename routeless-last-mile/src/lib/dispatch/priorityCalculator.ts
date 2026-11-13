import type { BusSearchResult } from '../../types';

/**
 * Calculates a numerical priority score for sorting bus results relative to preferred departure time.
 * Higher score = higher ranking.
 */
export function calculatePriority(
  result: BusSearchResult,
  preferredDepartureHHMM: string
): number {
  let score = 100;

  // 1. Time proximity delta (in minutes)
  if (preferredDepartureHHMM) {
    const [pPrefHours, pPrefMins] = preferredDepartureHHMM.split(':').map(Number);
    const prefMinutesOfDay = pPrefHours * 60 + pPrefMins;

    const [bHours, bMins] = result.departureTime.split(':').map(Number);
    const busMinutesOfDay = bHours * 60 + bMins;

    const diff = Math.abs(busMinutesOfDay - prefMinutesOfDay);
    // Deduct 1.5 points per minute difference from preferred time
    score -= Math.min(diff * 1.5, 70);
  }

  // 2. Status modifier
  switch (result.status) {
    case 'on-time':
      score += 30;
      break;
    case 'delayed':
      score -= 20;
      break;
    case 'full':
      score -= 60;
      break;
    case 'unavailable':
    case 'breakdown':
      score -= 200;
      break;
  }

  // 3. Seats available modifier
  const seats = result.bus.seatsAvailable;
  if (seats > 20) score += 20;
  else if (seats >= 10) score += 10;
  else if (seats > 0) score += 5;
  else score -= 30;

  // 4. Crowd level
  switch (result.crowdLevel) {
    case 'empty':
    case 'light':
      score += 15;
      break;
    case 'moderate':
      score += 5;
      break;
    case 'full':
      score -= 25;
      break;
  }

  return score;
}

export type TaggedBusSearchResult = BusSearchResult & { tags: string[] };

/**
 * Adds smart descriptive badges ("Best Match", "Fastest", "Least Crowded", etc.) to search results.
 */
export function tagBestOptions(
  results: BusSearchResult[]
): TaggedBusSearchResult[] {
  if (results.length === 0) return [];

  // Find max seats and fastest
  const maxSeats = Math.max(...results.map((r) => r.bus.seatsAvailable));

  return results.map((result, idx) => {
    const tags: string[] = [];

    if (idx === 0 && result.status !== 'breakdown' && result.status !== 'unavailable') {
      tags.push('Best Match');
    }
    if (result.status === 'on-time') {
      tags.push('On Time');
    }
    if (result.bus.seatsAvailable === maxSeats && maxSeats > 5) {
      tags.push('Most Seats');
    }
    if (result.crowdLevel === 'empty' || result.crowdLevel === 'light') {
      tags.push('Least Crowded');
    }

    return {
      ...result,
      tags,
    };
  });
}
