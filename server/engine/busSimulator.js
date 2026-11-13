// server/engine/busSimulator.js
// Realistic Bus Movement & Telemetry Simulation Engine for ROUTELESS

import { initialBuses, initialRoutes, initialStops } from '../data/transitData.js';
import { calculatePredictedDemand } from './demandPrediction.js';

export class BusSimulator {
  constructor() {
    this.routes = JSON.parse(JSON.stringify(initialRoutes));
    this.stops = JSON.parse(JSON.stringify(initialStops));
    this.buses = JSON.parse(JSON.stringify(initialBuses));
    this.simulationRunning = true;
    this.simulationSpeed = 1.0; // 1x, 2x, 5x
    this.tickIntervalMs = 2000; // tick every 2 seconds
    this.timer = null;
    this.listeners = [];

    // Initialize predictions for each bus
    this.refreshPredictions();
  }

  refreshPredictions() {
    this.buses.forEach(bus => {
      const pred = calculatePredictedDemand({
        routeId: bus.routeId,
        departureTimeStr: "08:15 AM",
        busCapacity: bus.capacity
      });
      bus.predictedPassengers = pred.predictedPassengers;
      bus.occupancyPercentage = Math.round((bus.actualPassengers / bus.capacity) * 100);
      bus.predictedOccupancyPercentage = pred.occupancyPercentage;
      bus.crowdLevel = pred.crowdLevel;
      bus.crowdColor = pred.crowdColor;
      bus.crowdBadge = pred.crowdBadge;
    });
  }

  start() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.simulationRunning) {
        this.stepSimulation();
      }
    }, this.tickIntervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setSpeed(speedMultiplier) {
    this.simulationSpeed = Math.max(0.2, Math.min(10, speedMultiplier));
  }

  togglePause() {
    this.simulationRunning = !this.simulationRunning;
    return this.simulationRunning;
  }

  resetFleet() {
    this.buses = JSON.parse(JSON.stringify(initialBuses));
    this.refreshPredictions();
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    const payload = {
      timestamp: new Date().toISOString(),
      buses: this.buses,
      simulationRunning: this.simulationRunning,
      simulationSpeed: this.simulationSpeed
    };
    this.listeners.forEach(fn => {
      try {
        fn(payload);
      } catch (err) {
        console.error("Error in simulator listener:", err);
      }
    });
  }

  stepSimulation() {
    const stepRatio = 0.04 * this.simulationSpeed;

    this.buses.forEach(bus => {
      const route = this.routes.find(r => r.id === bus.routeId);
      if (!route || !route.pathCoordinates || route.pathCoordinates.length < 2) return;

      const path = route.pathCoordinates;

      if (bus.status === "AT_STOP" || bus.status === "BOARDING") {
        // Dwell time countdown
        bus.dwellSeconds = (bus.dwellSeconds || 0) + (2 * this.simulationSpeed);
        if (bus.dwellSeconds >= 10) {
          bus.status = "EN_ROUTE";
          bus.dwellSeconds = 0;
          // Random boarding/alighting update
          const delta = Math.floor(Math.random() * 7) - 2;
          bus.actualPassengers = Math.max(8, Math.min(bus.capacity + 8, bus.actualPassengers + delta));
          bus.occupancyPercentage = Math.round((bus.actualPassengers / bus.capacity) * 100);
        }
        return;
      }

      // Advance along path
      bus.progressAlongSegment = (bus.progressAlongSegment || 0) + stepRatio;

      if (bus.progressAlongSegment >= 1.0) {
        bus.progressAlongSegment = 0;
        bus.currentSegmentIndex = (bus.currentSegmentIndex || 0) + 1;

        if (bus.currentSegmentIndex >= path.length - 1) {
          // Loop or reach terminal
          bus.currentSegmentIndex = 0;
          bus.status = "AT_STOP";
          bus.dwellSeconds = 0;
        } else {
          // Check if near any route stop
          const currentPoint = path[bus.currentSegmentIndex];
          const matchingStop = this.findNearestStop(currentPoint, route.stops);
          if (matchingStop) {
            bus.status = "APPROACHING";
            bus.nextStopId = matchingStop.id;
          }
        }
      }

      // Interpolate coordinates between segment start and end
      const segIdx = bus.currentSegmentIndex || 0;
      const p1 = path[segIdx];
      const p2 = path[segIdx + 1] || path[0];
      const t = bus.progressAlongSegment;

      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;

      bus.currentLocation = [Number(lat.toFixed(5)), Number(lng.toFixed(5))];
      bus.lastUpdated = new Date().toISOString();

      // Recalculate ETA to next stop
      if (bus.nextStopEtaMinutes > 1) {
        bus.nextStopEtaMinutes = Math.max(1, bus.nextStopEtaMinutes - (0.05 * this.simulationSpeed));
      } else {
        bus.nextStopEtaMinutes = Math.max(1, Math.round(2 + Math.random() * 4));
      }

      // Keep occupancy percentage sync
      bus.occupancyPercentage = Math.round((bus.actualPassengers / bus.capacity) * 100);
    });

    this.notifyListeners();
  }

  findNearestStop(coord, routeStopIds) {
    for (const stopId of routeStopIds) {
      const stop = this.stops.find(s => s.id === stopId);
      if (stop) {
        const dLat = Math.abs(stop.coordinates[0] - coord[0]);
        const dLng = Math.abs(stop.coordinates[1] - coord[1]);
        if (dLat < 0.005 && dLng < 0.005) {
          return stop;
        }
      }
    }
    return null;
  }

  getFleet() {
    return this.buses;
  }

  getBusById(id) {
    return this.buses.find(b => b.id === id);
  }

  updatePassengerCount(busId, newCount) {
    const bus = this.buses.find(b => b.id === busId);
    if (bus) {
      bus.actualPassengers = Math.max(0, parseInt(newCount, 10));
      bus.occupancyPercentage = Math.round((bus.actualPassengers / bus.capacity) * 100);
      this.notifyListeners();
      return bus;
    }
    return null;
  }

  updateBusDelay(busId, delayMinutes) {
    const bus = this.buses.find(b => b.id === busId);
    if (bus) {
      bus.delayMinutes = parseInt(delayMinutes, 10);
      bus.status = bus.delayMinutes > 5 ? "DELAYED" : bus.status;
      this.notifyListeners();
      return bus;
    }
    return null;
  }

  addBus(newBusData) {
    const newBus = {
      id: `BUS-${Date.now().toString().slice(-4)}`,
      busNumber: newBusData.busNumber || "KA-01-EXP-" + Math.floor(1000 + Math.random() * 9000),
      fleetName: newBusData.fleetName || "Express Campus Shuttle",
      routeId: newBusData.routeId || "R-101",
      capacity: parseInt(newBusData.capacity, 10) || 50,
      seatingCapacity: Math.round((parseInt(newBusData.capacity, 10) || 50) * 0.8),
      standingCapacity: Math.round((parseInt(newBusData.capacity, 10) || 50) * 0.2),
      busType: newBusData.busType || "Standard Electric AC",
      operator: newBusData.operator || "State Student Transit Corp",
      currentLocation: [12.9550, 77.5920],
      currentSegmentIndex: 0,
      progressAlongSegment: 0,
      speedKmph: 32,
      status: "BOARDING",
      currentStopIndex: 0,
      nextStopId: "ST-02",
      nextStopEtaMinutes: 8,
      delayMinutes: 0,
      actualPassengers: parseInt(newBusData.actualPassengers, 10) || 12,
      predictedPassengers: 35,
      isSimulatedGps: true,
      lastUpdated: new Date().toISOString()
    };
    this.buses.push(newBus);
    this.refreshPredictions();
    this.notifyListeners();
    return newBus;
  }

  removeBus(busId) {
    const idx = this.buses.findIndex(b => b.id === busId);
    if (idx !== -1) {
      const removed = this.buses.splice(idx, 1)[0];
      this.notifyListeners();
      return removed;
    }
    return null;
  }
}

