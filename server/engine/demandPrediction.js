// server/engine/demandPrediction.js
// Student Demand Forecasting & Crowd Analytics Engine for ROUTELESS

/**
 * Predicts student passenger demand for a given bus, route, and time parameters.
 */
export function calculatePredictedDemand({
  routeId,
  departureTimeStr, // e.g., "08:15 AM" or hour:minute
  dayOfWeek = "Wednesday", // Monday - Sunday
  busCapacity = 52,
  weatherCondition = "clear", // "clear", "rain", "heavy_rain"
  academicStatus = "regular_classes" // "regular_classes", "exams", "weekend_labs", "vacation"
}) {
  // Parse hour and minute
  let hour = 8;
  let minute = 0;
  if (departureTimeStr) {
    const parts = departureTimeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (parts) {
      hour = parseInt(parts[1], 10);
      minute = parseInt(parts[2], 10);
      const meridiem = parts[3] ? parts[3].toUpperCase() : null;
      if (meridiem === 'PM' && hour < 12) hour += 12;
      if (meridiem === 'AM' && hour === 12) hour = 0;
    }
  }

  const timeDecimal = hour + minute / 60;

  // 1. Base route demand multiplier (Route 101 and 305 serve key hostel-to-campus corridors)
  const routeBaseFactors = {
    "R-101": 1.25, // Campus Blue Express (Main Corridor)
    "R-204": 0.95, // Green Line (Engineering link)
    "R-305": 1.35, // Crimson Shuttle (Hostel Direct - heavy student rush)
    "R-408": 0.85, // Amber Orbit (Loop)
    "R-512": 1.15  // Violet Commuter (Inter-campus)
  };
  const routeMultiplier = routeBaseFactors[routeId] || 1.0;

  // 2. Time-of-Day Curve (Students have distinct peak college arrival & departure windows)
  // Morning college opening: 07:30 - 09:30 AM (Peak 08:00 - 08:35)
  // Midday shift / lab dismissals: 12:30 - 02:00 PM
  // Evening college closing: 03:30 - 05:45 PM (Peak 04:15 - 05:00)
  let timeMultiplier = 0.35; // Default non-peak baseline

  if (timeDecimal >= 7.0 && timeDecimal <= 9.5) {
    // Morning Rush Bell Curve centered at 8.25 (8:15 AM)
    const delta = Math.abs(timeDecimal - 8.25);
    timeMultiplier = Math.max(0.4, 1.45 - delta * 0.85);
  } else if (timeDecimal > 9.5 && timeDecimal < 12.5) {
    // Quiet study / lecture hours
    timeMultiplier = 0.42;
  } else if (timeDecimal >= 12.5 && timeDecimal <= 14.5) {
    // Lunch / Half-day lab release
    timeMultiplier = 0.78;
  } else if (timeDecimal >= 15.5 && timeDecimal <= 18.0) {
    // Evening return rush centered at 16.5 (4:30 PM)
    const delta = Math.abs(timeDecimal - 16.5);
    timeMultiplier = Math.max(0.45, 1.38 - delta * 0.75);
  } else if (timeDecimal > 18.0 && timeDecimal <= 21.0) {
    // Library & evening coaching commuters
    timeMultiplier = 0.55;
  } else {
    // Late night / early dawn
    timeMultiplier = 0.25;
  }

  // 3. Day of the Week Multiplier
  const dayFactors = {
    "Monday": 1.22,    // Monday morning rush (+22%)
    "Tuesday": 1.05,
    "Wednesday": 1.00,  // Standard baseline
    "Thursday": 1.02,
    "Friday": 1.15,     // Friday weekend departure rush
    "Saturday": 0.52,   // Half-day / lab students only
    "Sunday": 0.18      // Minimal student transit
  };
  const dayMultiplier = dayFactors[dayOfWeek] || 1.0;

  // 4. Academic Calendar Modifier
  const academicFactors = {
    "regular_classes": 1.0,
    "exams": 1.28,        // Simultaneous dismissal & strict reporting times
    "weekend_labs": 0.55,
    "vacation": 0.22
  };
  const academicMultiplier = academicFactors[academicStatus] || 1.0;

  // 5. Weather Condition Modifier
  // Rain causes students on bicycles / bikes to shift to public buses
  const weatherFactors = {
    "clear": 1.0,
    "rain": 1.18,
    "heavy_rain": 1.32
  };
  const weatherMultiplier = weatherFactors[weatherCondition] || 1.0;

  // Calculate base expected student boarding count
  const baseBaselinePassengers = 36;
  const rawPredicted = Math.round(
    baseBaselinePassengers * routeMultiplier * timeMultiplier * dayMultiplier * academicMultiplier * weatherMultiplier
  );

  const predictedPassengers = Math.max(5, rawPredicted);
  const occupancyPercentage = Math.round((predictedPassengers / busCapacity) * 100);

  // Determine Crowd Level
  let crowdLevel = "LOW";
  let crowdColor = "green";
  let crowdBadge = "🟢 Low Crowd";
  let probabilityOfHighDemand = 0.12;

  if (occupancyPercentage > 95) {
    crowdLevel = "EXTREME";
    crowdColor = "red";
    crowdBadge = "🔴 Extreme Rush";
    probabilityOfHighDemand = 0.94;
  } else if (occupancyPercentage >= 75) {
    crowdLevel = "HIGH";
    crowdColor = "orange";
    crowdBadge = "🟠 High Crowd";
    probabilityOfHighDemand = 0.78;
  } else if (occupancyPercentage >= 45) {
    crowdLevel = "MODERATE";
    crowdColor = "yellow";
    crowdBadge = "🟡 Moderate Crowd";
    probabilityOfHighDemand = 0.42;
  } else {
    crowdLevel = "LOW";
    crowdColor = "green";
    crowdBadge = "🟢 Low Crowd";
    probabilityOfHighDemand = 0.15;
  }

  // Seating assessment
  const estimatedSeatsRemaining = Math.max(0, busCapacity - predictedPassengers);
  const standingEstimate = Math.max(0, predictedPassengers - Math.round(busCapacity * 0.78));

  // Confidence Score (based on historical sample density)
  const confidenceScore = Math.min(96, Math.max(82, 95 - Math.abs(timeDecimal - 8.5) * 2));

  return {
    predictedPassengers,
    busCapacity,
    occupancyPercentage,
    crowdLevel,
    crowdColor,
    crowdBadge,
    probabilityOfHighDemand,
    estimatedSeatsRemaining,
    standingEstimate,
    confidenceScore: Math.round(confidenceScore),
    factors: {
      routeMultiplier: Number(routeMultiplier.toFixed(2)),
      timeMultiplier: Number(timeMultiplier.toFixed(2)),
      dayMultiplier: Number(dayMultiplier.toFixed(2)),
      academicMultiplier: Number(academicMultiplier.toFixed(2)),
      weatherMultiplier: Number(weatherMultiplier.toFixed(2))
    }
  };
}

/**
 * Generates an hourly heatmap matrix across the day (06:00 to 20:00) for all routes or by day
 */
export function generateHeatmapMatrix({ dayOfWeek = "Wednesday", selectedRouteId = null }) {
  const hours = [
    { label: "06:00", hour: 6 },
    { label: "07:00", hour: 7 },
    { label: "07:30", hour: 7.5 },
    { label: "08:00", hour: 8 },
    { label: "08:30", hour: 8.5 },
    { label: "09:00", hour: 9 },
    { label: "10:00", hour: 10 },
    { label: "11:00", hour: 11 },
    { label: "12:00", hour: 12 },
    { label: "13:00", hour: 13 },
    { label: "14:00", hour: 14 },
    { label: "15:00", hour: 15 },
    { label: "16:00", hour: 16 },
    { label: "17:00", hour: 17 },
    { label: "18:00", hour: 18 },
    { label: "19:00", hour: 19 },
    { label: "20:00", hour: 20 }
  ];

  const routes = [
    { id: "R-101", name: "101 Blue Express", college: "Apex Inst (AITS)" },
    { id: "R-204", name: "204 Green Line", college: "St. Xavier's (SXEC)" },
    { id: "R-305", name: "305 Crimson Shuttle", college: "CCU Medical Campus" },
    { id: "R-408", name: "408 Amber Orbit", college: "National Law (NLDA)" },
    { id: "R-512", name: "512 Violet Commuter", college: "Apex Inst (AITS)" }
  ];

  const filteredRoutes = selectedRouteId
    ? routes.filter(r => r.id === selectedRouteId)
    : routes;

  // Build grid data
  const grid = filteredRoutes.map(route => {
    const slots = hours.map(slot => {
      const timeStr = `${Math.floor(slot.hour).toString().padStart(2, '0')}:${slot.hour % 1 !== 0 ? '30' : '00'} AM`;
      const prediction = calculatePredictedDemand({
        routeId: route.id,
        departureTimeStr: timeStr,
        dayOfWeek,
        busCapacity: 50
      });

      return {
        hourLabel: slot.label,
        hourDecimal: slot.hour,
        predictedOccupancy: prediction.occupancyPercentage,
        predictedPassengers: prediction.predictedPassengers,
        crowdLevel: prediction.crowdLevel,
        crowdColor: prediction.crowdColor,
        isOptimalWindow: prediction.occupancyPercentage <= 50 && (slot.hour >= 7 && slot.hour <= 18)
      };
    });

    return {
      routeId: route.id,
      routeName: route.name,
      college: route.college,
      slots
    };
  });

  // Calculate Busiest Stops and Recommended Windows
  const busiestStops = [
    { stopName: "Sector 14 Hostel Colony", stopCode: "SEC-14", peakOccupancy: 118, crowdLevel: "EXTREME", peakTime: "08:15 AM - 08:45 AM" },
    { stopName: "Central Metro & Railway", stopCode: "CEN-STN", peakOccupancy: 104, crowdLevel: "EXTREME", peakTime: "08:00 AM - 08:30 AM" },
    { stopName: "Civic Center & Library", stopCode: "CIV-CTR", peakOccupancy: 88, crowdLevel: "HIGH", peakTime: "08:20 AM - 09:00 AM" },
    { stopName: "South Hills Crossroad", stopCode: "SH-CROSS", peakOccupancy: 76, crowdLevel: "HIGH", peakTime: "07:45 AM - 08:15 AM" },
    { stopName: "Greenfield Terminal", stopCode: "GF-TERM", peakOccupancy: 68, crowdLevel: "MODERATE", peakTime: "07:30 AM - 08:00 AM" }
  ];

  const recommendedLowCrowdWindows = [
    {
      window: "07:15 AM – 07:45 AM",
      phase: "Early Morning Advantage",
      averageOccupancy: 38,
      seatsAvailability: "Guaranteed Seat (~95%)",
      benefit: "Arrive 25 mins early, zero standing, fastest transit time"
    },
    {
      window: "09:05 AM – 09:40 AM",
      phase: "Post-Morning Surge",
      averageOccupancy: 44,
      seatsAvailability: "Comfortable (~82%)",
      benefit: "Ideal for 10:00 AM lectures or library research sessions"
    },
    {
      window: "01:45 PM – 03:00 PM",
      phase: "Midday Calm",
      averageOccupancy: 34,
      seatsAvailability: "Wide Choice (~98%)",
      benefit: "Least crowded time of the entire day"
    }
  ];

  return {
    dayOfWeek,
    grid,
    busiestStops,
    recommendedLowCrowdWindows
  };
}

