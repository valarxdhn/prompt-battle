// server/engine/recommendationEngine.js
// Smart Travel Recommendation Engine for ROUTELESS

import { initialRoutes, initialStops } from '../data/transitData.js';
import { calculatePredictedDemand } from './demandPrediction.js';

export function getTravelRecommendations({
  originStopId = "ST-02", // default: Sector 14 Hostel Colony
  destinationCampusId = "ST-09", // default: AITS Campus Main Gate
  desiredArrivalTime = "09:00 AM", // e.g. "09:00 AM"
  preference = "balanced", // "balanced", "least_crowded", "fastest", "guaranteed_seat"
  buses = [],
  schedules = []
}) {
  // Parse target arrival time in minutes from midnight
  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 9 * 60; // 09:00 AM default
    const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (!m) return 9 * 60;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const mer = m[3] ? m[3].toUpperCase() : 'AM';
    if (mer === 'PM' && h < 12) h += 12;
    if (mer === 'AM' && h === 12) h = 0;
    return h * 60 + min;
  }

  const targetArrivalMins = parseTimeToMinutes(desiredArrivalTime);

  // Find candidate routes that connect origin to destination
  const validRoutes = initialRoutes.filter(route => {
    const originIdx = route.stops.indexOf(originStopId);
    const destIdx = route.stops.indexOf(destinationCampusId);
    return originIdx !== -1 && destIdx !== -1 && originIdx < destIdx;
  });

  const validRouteIds = validRoutes.map(r => r.id);

  // Gather candidate scheduled trips and live buses
  const candidates = [];

  // Match live buses on these routes
  buses.filter(b => validRouteIds.includes(b.routeId)).forEach(bus => {
    const route = validRoutes.find(r => r.id === bus.routeId);
    const originStop = initialStops.find(s => s.id === originStopId);
    const destStop = initialStops.find(s => s.id === destinationCampusId);

    // Compute estimated departure from origin stop
    const etaToOrigin = Math.max(2, Math.round(bus.nextStopEtaMinutes || 5));
    const nowMinutes = 7 * 60 + 55; // reference simulation time around 07:55 AM
    const boardMinutes = nowMinutes + etaToOrigin;
    const transitMins = Math.round(route.estimatedNormalDurationMins * 0.85);
    const arrivalMins = boardMinutes + transitMins + (bus.delayMinutes || 0);

    const prediction = calculatePredictedDemand({
      routeId: bus.routeId,
      departureTimeStr: "08:15 AM",
      busCapacity: bus.capacity
    });

    candidates.push({
      type: "LIVE_BUS",
      busId: bus.id,
      busNumber: bus.busNumber,
      fleetName: bus.fleetName,
      routeId: route.id,
      routeName: route.name,
      routeColor: route.color,
      originName: originStop ? originStop.name : "Your Stop",
      destinationName: destStop ? destStop.name : "Target Campus",
      boardTimeStr: formatMinutesToTime(boardMinutes),
      boardMinutes,
      arrivalMinutes: arrivalMins,
      arrivalTimeStr: formatMinutesToTime(arrivalMins),
      journeyDurationMins: transitMins,
      actualPassengers: bus.actualPassengers,
      predictedPassengers: prediction.predictedPassengers,
      capacity: bus.capacity,
      occupancyRate: bus.occupancyPercentage,
      predictedOccupancy: prediction.occupancyPercentage,
      crowdLevel: prediction.crowdLevel,
      crowdColor: prediction.crowdColor,
      delayMinutes: bus.delayMinutes || 0,
      status: bus.status,
      speedKmph: bus.speedKmph
    });
  });

  // Match future scheduled departures
  schedules.filter(s => validRouteIds.includes(s.routeId)).forEach(sch => {
    const route = validRoutes.find(r => r.id === sch.routeId);
    const originStop = initialStops.find(s => s.id === originStopId);
    const destStop = initialStops.find(s => s.id === destinationCampusId);

    const schDepMins = parseTimeToMinutes(sch.departureTime);
    const transitMins = route ? route.estimatedNormalDurationMins : 40;
    const arrivalMins = schDepMins + transitMins;

    const prediction = calculatePredictedDemand({
      routeId: sch.routeId,
      departureTimeStr: sch.departureTime,
      busCapacity: 52
    });

    // Check if duplicate of live bus
    const exists = candidates.find(c => c.busId && c.busId === sch.busId);
    if (!exists) {
      candidates.push({
        type: "SCHEDULED_BUS",
        busId: sch.busId || `SCH-${sch.id}`,
        busNumber: sch.busNumber,
        fleetName: sch.destination,
        routeId: sch.routeId,
        routeName: route ? route.name : "Campus Route",
        routeColor: route ? route.color : "#2563eb",
        originName: originStop ? originStop.name : sch.origin,
        destinationName: destStop ? destStop.name : sch.destination,
        boardTimeStr: sch.departureTime,
        boardMinutes: schDepMins,
        arrivalMinutes: arrivalMins,
        arrivalTimeStr: formatMinutesToTime(arrivalMins),
        journeyDurationMins: transitMins,
        actualPassengers: null,
        predictedPassengers: prediction.predictedPassengers,
        capacity: 52,
        occupancyRate: prediction.occupancyPercentage,
        predictedOccupancy: prediction.occupancyPercentage,
        crowdLevel: prediction.crowdLevel,
        crowdColor: prediction.crowdColor,
        delayMinutes: 0,
        status: sch.status || "Scheduled",
        speedKmph: 35
      });
    }
  });

  // Fallback: If no direct route exists between arbitrary stops, generate route option
  if (candidates.length === 0) {
    const defaultRoute = initialRoutes[0];
    const prediction = calculatePredictedDemand({
      routeId: defaultRoute.id,
      departureTimeStr: "08:00 AM",
      busCapacity: 50
    });
    candidates.push({
      type: "SCHEDULED_BUS",
      busId: "FALLBACK-101",
      busNumber: "KA-01-F-4021",
      fleetName: "101 Blue Express",
      routeId: defaultRoute.id,
      routeName: defaultRoute.name,
      routeColor: defaultRoute.color,
      originName: "Sector 14 Hostel Colony",
      destinationName: "Apex Institute of Tech (AITS)",
      boardTimeStr: "08:00 AM",
      boardMinutes: 480,
      arrivalMinutes: 525,
      arrivalTimeStr: "08:45 AM",
      journeyDurationMins: 45,
      actualPassengers: 32,
      predictedPassengers: prediction.predictedPassengers,
      capacity: 52,
      occupancyRate: prediction.occupancyPercentage,
      predictedOccupancy: prediction.occupancyPercentage,
      crowdLevel: prediction.crowdLevel,
      crowdColor: prediction.crowdColor,
      delayMinutes: 0,
      status: "Scheduled",
      speedKmph: 35
    });
  }

  // Calculate Suitability Score for each option (0 to 100)
  candidates.forEach(cand => {
    let score = 70; // baseline

    // 1. Punctuality Scoring (Desired arrival window is 10 to 25 mins before desired arrival time)
    const timeDelta = targetArrivalMins - cand.arrivalMinutes;
    if (timeDelta >= 10 && timeDelta <= 25) {
      score += 25; // Perfect buffer!
    } else if (timeDelta > 25 && timeDelta <= 45) {
      score += 15; // A bit early, but safe
    } else if (timeDelta >= 0 && timeDelta < 10) {
      score += 10; // Tight, might be late with delay
    } else if (timeDelta < 0) {
      // Arrives late! Severe penalty
      score -= Math.min(45, Math.abs(timeDelta) * 3);
    } else {
      // Arrives way too early (> 45 mins)
      score -= 10;
    }

    // 2. Crowd Level Penalty / Bonus
    if (cand.predictedOccupancy <= 50) {
      score += 18; // Low crowd bonus! Easy seating
    } else if (cand.predictedOccupancy <= 75) {
      score += 5; // Moderate
    } else if (cand.predictedOccupancy <= 90) {
      score -= 12; // High crowd penalty
    } else {
      score -= 26; // Overcrowded rush
    }

    // 3. User Preference Modifier
    if (preference === "least_crowded") {
      score += (100 - cand.predictedOccupancy) * 0.3;
    } else if (preference === "fastest") {
      score += (60 - Math.min(60, cand.journeyDurationMins)) * 0.4;
    } else if (preference === "guaranteed_seat") {
      if (cand.predictedOccupancy < 65) score += 20;
      else score -= 25;
    }

    // 4. Delay Penalty
    if (cand.delayMinutes > 5) {
      score -= cand.delayMinutes * 2;
    }

    cand.suitabilityScore = Math.max(10, Math.min(99, Math.round(score)));

    // Generate Badges and Pros/Cons
    cand.tags = [];
    if (timeDelta >= 10 && timeDelta <= 30 && cand.predictedOccupancy < 75) {
      cand.tags.push("⭐ Recommended");
    }
    if (cand.predictedOccupancy < 55) {
      cand.tags.push("🪑 Seat Likely (~92%)");
    } else if (cand.predictedOccupancy > 90) {
      cand.tags.push("⚠️ Severe Crowd");
    }
    if (cand.journeyDurationMins <= 35) {
      cand.tags.push("⚡ Express Transit");
    }
    if (cand.delayMinutes > 3) {
      cand.tags.push(`⏱️ +${cand.delayMinutes}m Delay`);
    }

    cand.timeMarginMinutes = timeDelta;
  });

  // Sort descending by suitability score
  candidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);

  // Label the top choice as Top Recommendation
  if (candidates.length > 0) {
    candidates[0].isTopPick = true;
    if (!candidates[0].tags.includes("⭐ Recommended")) {
      candidates[0].tags.unshift("⭐ Best Choice");
    }
  }

  return {
    originStopId,
    destinationCampusId,
    desiredArrivalTime,
    preference,
    topRecommendation: candidates[0] || null,
    allOptions: candidates
  };
}

function formatMinutesToTime(totalMinutes) {
  let h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${meridiem}`;
}

