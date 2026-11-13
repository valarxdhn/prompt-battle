// server/engine/crisisEngine.js
// ROUTELESS Exam Day Crisis & Emergency Fleet Reallocation Engine

export class CrisisEngine {
  constructor(simulator) {
    this.simulator = simulator;
    this.isActive = false;
    this.crisisData = {
      title: "Exam Day Crisis: Flooded Corridor & Fleet Breakdown",
      timeToExamHours: 2,
      demandSurgePercent: 40,
      brokenBuses: [
        { id: "BUS-101B", busNumber: "KA-01-F-4022", reason: "Engine Transmission Failure" },
        { id: "BUS-305A", busNumber: "KA-04-E-1984", reason: "Coolant Leakage" }
      ],
      blockedRoad: {
        stopId: "ST-07",
        stopName: "Riverside Ring Road",
        cause: "Flash Flooding & Road Inaccessible",
        detourRoute: "Via Civic Center Bypass (+6 mins)"
      },
      impactMetrics: {
        totalExamStudents: 480,
        studentsStrandedWithoutAI: 195,
        studentsSavedOnTimeWithAI: 188,
        successRatePercent: 96.4,
        avgDelayMitigatedMinutes: 34
      },
      reallocations: [
        {
          busId: "BUS-408A",
          busNumber: "KA-01-D-9901",
          originalRoute: "R-408",
          targetRoute: "R-101",
          capacity: 65,
          assignment: "Reallocated to High-Priority Exam Corridor",
          reason: "Double Decker high capacity moved from low-demand loop to hostel exam corridor"
        },
        {
          busId: "BUS-204B",
          busNumber: "KA-05-A-8120",
          originalRoute: "R-204",
          targetRoute: "R-305",
          capacity: 48,
          assignment: "Rerouted Exam Relief Shuttle via Bypass",
          reason: "Bypasses flooded Riverside road directly to CCU & AITS exam halls"
        }
      ]
    };
  }

  activate() {
    this.isActive = true;

    // 1. Mark broken buses as OUT_OF_SERVICE in simulator
    this.crisisData.brokenBuses.forEach(b => {
      const bus = this.simulator.getBusById(b.id);
      if (bus) {
        bus.status = "OUT_OF_SERVICE";
        bus.speedKmph = 0;
        bus.actualPassengers = 0;
        bus.breakdownReason = b.reason;
      }
    });

    // 2. Reallocate spare high-capacity buses to exam corridor
    this.crisisData.reallocations.forEach(realloc => {
      const bus = this.simulator.getBusById(realloc.busId);
      if (bus) {
        bus.routeId = realloc.targetRoute;
        bus.isReliefBus = true;
        bus.fleetName = `⚡ EXAM RELIEF: ${bus.busNumber}`;
        bus.status = "EXAM_EXPRESS";
        bus.delayMinutes = 0;
        bus.speedKmph = 42;
      }
    });

    // 3. Mark blocked stop in simulator
    const blockedStop = this.simulator.stops.find(s => s.id === this.crisisData.blockedRoad.stopId);
    if (blockedStop) {
      blockedStop.isBlocked = true;
      blockedStop.blockReason = this.crisisData.blockedRoad.cause;
    }

    this.simulator.notifyListeners();
    return this.getStatus();
  }

  deactivate() {
    this.isActive = false;
    this.simulator.resetFleet();
    const blockedStop = this.simulator.stops.find(s => s.id === this.crisisData.blockedRoad.stopId);
    if (blockedStop) {
      blockedStop.isBlocked = false;
      delete blockedStop.blockReason;
    }
    return this.getStatus();
  }

  getStatus() {
    return {
      isActive: this.isActive,
      ...this.crisisData
    };
  }
}

