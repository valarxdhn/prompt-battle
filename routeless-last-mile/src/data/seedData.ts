import type {
  AppState,
  Bus,
  Route,
  Stop,
  Schedule,
  Driver,
  Disruption,
  AltTransportProvider,
} from '../types';

// ---------------------------------------------------------------------------
// Stops (~16.5°N, 80.6°E — rural Andhra Pradesh, India)
// ---------------------------------------------------------------------------
export const seedStops: Stop[] = [
  { id: 'stop-1', name: 'College Gate',      lat: 16.5120, lng: 80.5980 },
  { id: 'stop-2', name: 'Market Square',     lat: 16.5085, lng: 80.6120 },
  { id: 'stop-3', name: 'Railway Station',   lat: 16.5010, lng: 80.6310 },
  { id: 'stop-4', name: 'Hospital Junction', lat: 16.5200, lng: 80.6250 },
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
export const seedRoutes: Route[] = [
  {
    id: 'route-A',
    name: 'Route A — College to Station',
    direction: 'outbound',
    stops: [seedStops[0], seedStops[1], seedStops[2]], // 1 → 2 → 3
  },
  {
    id: 'route-B',
    name: 'Route B — College to Station via Hospital',
    direction: 'outbound',
    stops: [seedStops[0], seedStops[3], seedStops[2]], // 1 → 4 → 3
  },
];

// ---------------------------------------------------------------------------
// Schedules  (morning window 06:30 – 09:00)
// ---------------------------------------------------------------------------
export const seedSchedules: Schedule[] = [
  {
    id: 'sched-101-A',
    busId: 'bus-101',
    routeId: 'route-A',
    departureTime: '06:30',
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon–Sat
    stops: [
      { stopId: 'stop-1', arrivalTime: '06:30' },
      { stopId: 'stop-2', arrivalTime: '06:45' },
      { stopId: 'stop-3', arrivalTime: '07:05' },
    ],
  },
  {
    id: 'sched-102-B',
    busId: 'bus-102',
    routeId: 'route-B',
    departureTime: '07:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    stops: [
      { stopId: 'stop-1', arrivalTime: '07:00' },
      { stopId: 'stop-4', arrivalTime: '07:20' },
      { stopId: 'stop-3', arrivalTime: '07:45' },
    ],
  },
  {
    id: 'sched-103-A',
    busId: 'bus-103',
    routeId: 'route-A',
    departureTime: '08:00',
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    stops: [
      { stopId: 'stop-1', arrivalTime: '08:00' },
      { stopId: 'stop-2', arrivalTime: '08:15' },
      { stopId: 'stop-3', arrivalTime: '08:35' },
    ],
  },
  {
    id: 'sched-204-B',
    busId: 'bus-204',
    routeId: 'route-B',
    departureTime: '08:30',
    daysOfWeek: [1, 2, 3, 4, 5, 6],
    stops: [
      { stopId: 'stop-1', arrivalTime: '08:30' },
      { stopId: 'stop-4', arrivalTime: '08:50' },
      { stopId: 'stop-3', arrivalTime: '09:15' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Buses
// ---------------------------------------------------------------------------
const NOW = new Date().toISOString();

export const seedBuses: Bus[] = [
  {
    id: 'bus-101',
    registrationNumber: 'AP29BZ0101',
    capacity: 60,
    type: 'standard',
    driverId: 'driver-1',
    status: 'on-time',
    operationalStatus: 'running',
    currentOccupancy: 22,
    seatsAvailable: 38,
    currentLat: 16.5115,
    currentLng: 80.6005,
    lastUpdated: NOW,
    lastUpdatedBy: 'driver',
    delayMinutes: 0,
    dataType: 'ACTUAL',
    note: '',
  },
  {
    id: 'bus-102',
    registrationNumber: 'AP29BZ0102',
    capacity: 30,
    type: 'mini',
    driverId: 'driver-2',
    status: 'delayed',
    operationalStatus: 'delayed',
    currentOccupancy: 18,
    seatsAvailable: 12,
    currentLat: 16.5095,
    currentLng: 80.6090,
    lastUpdated: NOW,
    lastUpdatedBy: 'driver',
    delayMinutes: 10,
    dataType: 'ACTUAL',
    note: 'Traffic jam near Market Square',
  },
  {
    id: 'bus-103',
    registrationNumber: 'AP29BZ0103',
    capacity: 60,
    type: 'standard',
    driverId: 'driver-3',
    status: 'on-time',
    operationalStatus: 'running',
    currentOccupancy: 5,
    seatsAvailable: 55,
    currentLat: 16.5118,
    currentLng: 80.5985,
    lastUpdated: NOW,
    lastUpdatedBy: 'system',
    delayMinutes: 0,
    dataType: 'ACTUAL',
    note: '',
  },
  {
    id: 'bus-204',
    registrationNumber: 'AP29BZ0204',
    capacity: 80,
    type: 'articulated',
    driverId: undefined,
    status: 'breakdown',
    operationalStatus: 'out-of-service',
    currentOccupancy: 0,
    seatsAvailable: 0,
    currentLat: 16.5195,
    currentLng: 80.6245,
    lastUpdated: NOW,
    lastUpdatedBy: 'driver',
    delayMinutes: 0,
    dataType: 'ACTUAL',
    note: 'Engine failure near Hospital Junction',
  },
];

// ---------------------------------------------------------------------------
// Drivers
// ---------------------------------------------------------------------------
export const seedDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Ravi Kumar',
    phone: '+91 94400 11111',
    assignedBusId: 'bus-101',
    registrationNumber: 'AP29BZ0101',
    onDuty: true,
    dataType: 'ACTUAL',
  },
  {
    id: 'driver-2',
    name: 'Suresh Babu',
    phone: '+91 94400 22222',
    assignedBusId: 'bus-102',
    registrationNumber: 'AP29BZ0102',
    onDuty: true,
    dataType: 'ACTUAL',
  },
  {
    id: 'driver-3',
    name: 'Anand Rao',
    phone: '+91 94400 33333',
    assignedBusId: 'bus-103',
    registrationNumber: 'AP29BZ0103',
    onDuty: true,
    dataType: 'ACTUAL',
  },
];

// ---------------------------------------------------------------------------
// Disruptions
// ---------------------------------------------------------------------------
export const seedDisruptions: Disruption[] = [
  {
    id: 'disrupt-1',
    busId: 'bus-204',
    routeId: 'route-B',
    type: 'breakdown',
    severity: 'critical',
    affectedStops: ['stop-4', 'stop-3'],
    description: 'BUS-204 has broken down near Hospital Junction due to engine failure. Service on Route B 08:30 is cancelled.',
    lat: 16.5195,
    lng: 80.6245,
    reportedAt: NOW,
    acknowledged: false,
    resolved: false,
    dataType: 'ACTUAL',
  },
  {
    id: 'disrupt-2',
    busId: 'bus-102',
    routeId: 'route-B',
    type: 'congestion',
    severity: 'medium',
    affectedStops: ['stop-2', 'stop-3'],
    description: 'Heavy traffic near Market Square causing ~10 min delay for BUS-102.',
    lat: 16.5085,
    lng: 80.6120,
    reportedAt: NOW,
    acknowledged: false,
    resolved: false,
    dataType: 'ACTUAL',
  },
];

// ---------------------------------------------------------------------------
// Alternative Transport Providers (all SIMULATED, fares in INR)
// ---------------------------------------------------------------------------
export const seedAltProviders: AltTransportProvider[] = [
  {
    id: 'alt-1',
    name: 'Sri Venkateswara Private Bus',
    type: 'private-bus',
    phone: '+91 94401 55551',
    availability: 'available',
    estimatedArrivalMinutes: 15,
    estimatedCostMin: 20,
    estimatedCostMax: 40,
    currency: 'INR',
    tags: ['AC', 'shared', 'punctual'],
    dataType: 'SIMULATED',
    routes: ['route-A', 'route-B'],
  },
  {
    id: 'alt-2',
    name: 'City Cab Services',
    type: 'taxi',
    phone: '+91 94401 55552',
    availability: 'available',
    estimatedArrivalMinutes: 8,
    estimatedCostMin: 80,
    estimatedCostMax: 150,
    currency: 'INR',
    tags: ['AC', 'metered', 'door-to-door'],
    dataType: 'SIMULATED',
    routes: ['route-A', 'route-B'],
  },
  {
    id: 'alt-3',
    name: 'Raja Auto Rickshaw',
    type: 'auto-rickshaw',
    phone: '+91 94401 55553',
    availability: 'available',
    estimatedArrivalMinutes: 5,
    estimatedCostMin: 30,
    estimatedCostMax: 70,
    currency: 'INR',
    tags: ['quick', 'local', 'no-AC'],
    dataType: 'SIMULATED',
    routes: ['route-A'],
  },
  {
    id: 'alt-4',
    name: 'Lakshmi Auto Stand',
    type: 'auto-rickshaw',
    phone: '+91 94401 55554',
    availability: 'limited',
    estimatedArrivalMinutes: 10,
    estimatedCostMin: 35,
    estimatedCostMax: 75,
    currency: 'INR',
    tags: ['shared', 'local', 'affordable'],
    dataType: 'SIMULATED',
    routes: ['route-B'],
  },
];

// ---------------------------------------------------------------------------
// Initial App State
// ---------------------------------------------------------------------------
export const initialState: AppState = {
  role: null,
  buses: seedBuses,
  routes: seedRoutes,
  stops: seedStops,
  schedules: seedSchedules,
  drivers: seedDrivers,
  disruptions: seedDisruptions,
  reminders: [],
  altProviders: seedAltProviders,
  activeDriverBusId: null,
  toasts: [],
};
