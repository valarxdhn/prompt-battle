export type DataType = 'ACTUAL' | 'PREDICTED' | 'SIMULATED';

export type BusStatus = 'on-time' | 'delayed' | 'full' | 'unavailable' | 'breakdown';
export type CrowdLevel = 'empty' | 'light' | 'moderate' | 'full';
export type OperationalStatus = 'running' | 'delayed' | 'stopped' | 'out-of-service';
export type DisruptionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type UserRole = 'student' | 'admin' | 'driver';
export type AltTransportType = 'private-bus' | 'taxi' | 'auto-rickshaw' | 'shared-cab' | 'other';

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  stops: Stop[];
  direction: 'inbound' | 'outbound' | 'circular';
}

export interface Schedule {
  id: string;
  busId: string;
  routeId: string;
  departureTime: string; // "HH:MM"
  stops: { stopId: string; arrivalTime: string }[];
  daysOfWeek: number[]; // 0=Sun..6=Sat
}

export interface Bus {
  id: string;
  registrationNumber: string;
  capacity: number;
  type: 'mini' | 'standard' | 'articulated';
  driverId?: string;
  status: BusStatus;
  operationalStatus: OperationalStatus;
  currentOccupancy: number;
  seatsAvailable: number;
  currentLat?: number;
  currentLng?: number;
  lastUpdated: string; // ISO
  lastUpdatedBy: 'driver' | 'admin' | 'system';
  delayMinutes: number;
  dataType: DataType;
  note?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  assignedBusId?: string;
  registrationNumber?: string;
  onDuty: boolean;
  dataType: DataType;
}

export interface Disruption {
  id: string;
  busId: string;
  routeId: string;
  type: 'breakdown' | 'congestion' | 'full' | 'no-gps' | 'delay';
  severity: DisruptionSeverity;
  affectedStops: string[];
  description: string;
  lat?: number;
  lng?: number;
  reportedAt: string; // ISO
  acknowledged: boolean;
  resolved: boolean;
  dataType: DataType;
}

export interface Reminder {
  id: string;
  busId: string;
  scheduleId: string;
  stopId: string;
  busNumber: string;
  stopName: string;
  busArrivalTime: string; // ISO
  minutesBefore: number;
  reminderTime: string; // ISO
  triggered: boolean;
  cancelled: boolean;
  updatedDueToDisruption: boolean;
  createdAt: string;
}

export interface AltTransportProvider {
  id: string;
  name: string;
  type: AltTransportType;
  phone: string;
  availability: 'available' | 'limited' | 'unavailable';
  estimatedArrivalMinutes: number;
  estimatedCostMin: number;
  estimatedCostMax: number;
  currency: string;
  tags: string[];
  dataType: 'SIMULATED'; // always simulated
  routes?: string[]; // route ids it covers
}

export interface BusSearchResult {
  bus: Bus;
  schedule: Schedule;
  route: Route;
  boardingStop: Stop;
  departureTime: string;
  etaAtStop: string; // ISO
  arrivalAtDestination: string; // ISO
  status: BusStatus;
  crowdLevel: CrowdLevel;
  dataType: DataType;
}

export interface AppState {
  role: UserRole | null;
  buses: Bus[];
  routes: Route[];
  stops: Stop[];
  schedules: Schedule[];
  drivers: Driver[];
  disruptions: Disruption[];
  reminders: Reminder[];
  altProviders: AltTransportProvider[];
  activeDriverBusId: string | null;
  toasts: Toast[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

export type AppAction =
  | { type: 'SET_ROLE'; payload: UserRole | null }
  | { type: 'UPDATE_BUS'; payload: Partial<Bus> & { id: string } }
  | { type: 'ADD_BUS'; payload: Bus }
  | { type: 'REMOVE_BUS'; payload: string }
  | { type: 'ADD_ROUTE'; payload: Route }
  | { type: 'UPDATE_ROUTE'; payload: Partial<Route> & { id: string } }
  | { type: 'REMOVE_ROUTE'; payload: string }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Partial<Schedule> & { id: string } }
  | { type: 'REMOVE_SCHEDULE'; payload: string }
  | { type: 'ADD_DRIVER'; payload: Driver }
  | { type: 'UPDATE_DRIVER'; payload: Partial<Driver> & { id: string } }
  | { type: 'REMOVE_DRIVER'; payload: string }
  | { type: 'ADD_DISRUPTION'; payload: Disruption }
  | { type: 'ACKNOWLEDGE_DISRUPTION'; payload: string }
  | { type: 'RESOLVE_DISRUPTION'; payload: string }
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Partial<Reminder> & { id: string } }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'ADD_ALT_PROVIDER'; payload: AltTransportProvider }
  | { type: 'UPDATE_ALT_PROVIDER'; payload: Partial<AltTransportProvider> & { id: string } }
  | { type: 'REMOVE_ALT_PROVIDER'; payload: string }
  | { type: 'SET_ACTIVE_DRIVER_BUS'; payload: string | null }
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'DRIVER_UPDATE_STATUS'; payload: { busId: string; operationalStatus: OperationalStatus; delayMinutes?: number; note?: string } }
  | { type: 'DRIVER_UPDATE_OCCUPANCY'; payload: { busId: string; currentOccupancy: number } }
  | { type: 'DRIVER_REPORT_BREAKDOWN'; payload: { busId: string; note?: string; lat?: number; lng?: number } }
  | { type: 'DRIVER_REPORT_FULL'; payload: { busId: string } }
  | { type: 'DRIVER_UPDATE_LOCATION'; payload: { busId: string; lat: number; lng: number } }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> };
