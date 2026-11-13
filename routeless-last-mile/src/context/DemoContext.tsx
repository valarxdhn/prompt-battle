'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';

import type {
  AppAction,
  AppState,
  Bus,
  Disruption,
  Toast,
} from '../types';

import { initialState } from '../data/seedData';
import { loadFromStorage, saveToStorage } from '../lib/storage';
import {
  busStatusFromOperational,
  crowdLevelFromOccupancy,
  generateId,
} from '../utils/helpers';

// ---------------------------------------------------------------------------
// Helpers used only inside the reducer
// ---------------------------------------------------------------------------

function updateBus(buses: Bus[], id: string, patch: Partial<Bus>): Bus[] {
  return buses.map((b) => (b.id === id ? { ...b, ...patch, lastUpdated: new Date().toISOString() } : b));
}

function makeDisruption(
  partial: Omit<Disruption, 'id' | 'reportedAt' | 'acknowledged' | 'resolved'>,
): Disruption {
  return {
    ...partial,
    id: `disrupt-${generateId()}`,
    reportedAt: new Date().toISOString(),
    acknowledged: false,
    resolved: false,
  };
}

function makeToast(
  message: string,
  type: Toast['type'] = 'info',
  duration = 5000,
): Toast {
  return { id: `toast-${generateId()}`, message, type, duration };
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // ------------------------------------------------------------------ role
    case 'SET_ROLE':
      return { ...state, role: action.payload };

    // ------------------------------------------------------------------ bus
    case 'ADD_BUS':
      return { ...state, buses: [...state.buses, action.payload] };

    case 'REMOVE_BUS':
      return { ...state, buses: state.buses.filter((b) => b.id !== action.payload) };

    case 'UPDATE_BUS': {
      const { id, ...patch } = action.payload;
      const target = state.buses.find((b) => b.id === id);
      if (!target) return state;

      const updated = { ...target, ...patch, lastUpdated: new Date().toISOString() };
      const newBuses = state.buses.map((b) => (b.id === id ? updated : b));

      let newDisruptions = state.disruptions;
      let newToasts = state.toasts;
      let newReminders = state.reminders;

      // Auto-add disruption when a bus becomes broken/unavailable via UPDATE_BUS
      if (
        (patch.status === 'breakdown' || patch.status === 'unavailable') &&
        target.status !== patch.status
      ) {
        const isBreakdown = patch.status === 'breakdown';
        const route = state.routes.find((r) =>
          state.schedules.some((s) => s.busId === id && s.routeId === r.id),
        );
        const affectedSchedule = state.schedules.find((s) => s.busId === id);
        const affectedStopIds = affectedSchedule?.stops.map((s) => s.stopId) ?? [];
        const disrupt = makeDisruption({
          busId: id,
          routeId: route?.id ?? '',
          type: isBreakdown ? 'breakdown' : 'no-gps',
          severity: isBreakdown ? 'critical' : 'high',
          affectedStops: affectedStopIds,
          description: patch.note ?? `${updated.registrationNumber} reported as ${patch.status}.`,
          lat: updated.currentLat,
          lng: updated.currentLng,
          dataType: 'ACTUAL',
        });
        newDisruptions = [...state.disruptions, disrupt];

        // Cancel reminders for this bus & add toasts
        newReminders = state.reminders.map((r) => {
          if (r.busId === id && !r.cancelled && !r.triggered) {
            const toast = makeToast(
              `⚠️ Your reminder for ${r.busNumber} at ${r.stopName} has been cancelled — bus is ${patch.status}.`,
              'warning',
            );
            newToasts = [...newToasts, toast];
            return { ...r, cancelled: true, updatedDueToDisruption: true };
          }
          return r;
        });
      }

      return {
        ...state,
        buses: newBuses,
        disruptions: newDisruptions,
        reminders: newReminders,
        toasts: newToasts,
      };
    }

    // ---------------------------------------------------------------- route
    case 'ADD_ROUTE':
      return { ...state, routes: [...state.routes, action.payload] };

    case 'UPDATE_ROUTE': {
      const { id, ...patch } = action.payload;
      return {
        ...state,
        routes: state.routes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
    }

    case 'REMOVE_ROUTE':
      return { ...state, routes: state.routes.filter((r) => r.id !== action.payload) };

    // -------------------------------------------------------------- schedule
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };

    case 'UPDATE_SCHEDULE': {
      const { id, ...patch } = action.payload;
      return {
        ...state,
        schedules: state.schedules.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      };
    }

    case 'REMOVE_SCHEDULE':
      return { ...state, schedules: state.schedules.filter((s) => s.id !== action.payload) };

    // --------------------------------------------------------------- driver
    case 'ADD_DRIVER':
      return { ...state, drivers: [...state.drivers, action.payload] };

    case 'UPDATE_DRIVER': {
      const { id, ...patch } = action.payload;
      return {
        ...state,
        drivers: state.drivers.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      };
    }

    case 'REMOVE_DRIVER':
      return { ...state, drivers: state.drivers.filter((d) => d.id !== action.payload) };

    // ----------------------------------------------------------- disruption
    case 'ADD_DISRUPTION':
      return { ...state, disruptions: [...state.disruptions, action.payload] };

    case 'ACKNOWLEDGE_DISRUPTION':
      return {
        ...state,
        disruptions: state.disruptions.map((d) =>
          d.id === action.payload ? { ...d, acknowledged: true } : d,
        ),
      };

    case 'RESOLVE_DISRUPTION':
      return {
        ...state,
        disruptions: state.disruptions.map((d) =>
          d.id === action.payload ? { ...d, resolved: true, acknowledged: true } : d,
        ),
      };

    // ------------------------------------------------------------- reminder
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };

    case 'UPDATE_REMINDER': {
      const { id, ...patch } = action.payload;
      return {
        ...state,
        reminders: state.reminders.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
    }

    case 'DELETE_REMINDER':
      return { ...state, reminders: state.reminders.filter((r) => r.id !== action.payload) };

    // --------------------------------------------------------- alt provider
    case 'ADD_ALT_PROVIDER':
      return { ...state, altProviders: [...state.altProviders, action.payload] };

    case 'UPDATE_ALT_PROVIDER': {
      const { id, ...patch } = action.payload;
      return {
        ...state,
        altProviders: state.altProviders.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
    }

    case 'REMOVE_ALT_PROVIDER':
      return { ...state, altProviders: state.altProviders.filter((p) => p.id !== action.payload) };

    // --------------------------------------------------- active driver bus
    case 'SET_ACTIVE_DRIVER_BUS':
      return { ...state, activeDriverBusId: action.payload };

    // ---------------------------------------------------------------- toast
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };

    // -------------------------------------------------- driver: status update
    case 'DRIVER_UPDATE_STATUS': {
      const { busId, operationalStatus, delayMinutes = 0, note } = action.payload;
      const bus = state.buses.find((b) => b.id === busId);
      if (!bus) return state;

      const newStatus = busStatusFromOperational(operationalStatus, delayMinutes, bus.seatsAvailable);
      const updatedBuses = updateBus(state.buses, busId, {
        operationalStatus,
        delayMinutes,
        status: newStatus,
        lastUpdatedBy: 'driver',
        note: note ?? bus.note,
      });

      let newDisruptions = state.disruptions;

      if (operationalStatus === 'delayed' && delayMinutes > 0) {
        // Check if there's already an unresolved delay disruption for this bus
        const existing = state.disruptions.find(
          (d) => d.busId === busId && d.type === 'delay' && !d.resolved,
        );
        if (existing) {
          newDisruptions = state.disruptions.map((d) =>
            d.id === existing.id
              ? { ...d, description: `${bus.registrationNumber} delayed by ${delayMinutes} min. ${note ?? ''}`.trim() }
              : d,
          );
        } else {
          const route = state.routes.find((r) =>
            state.schedules.some((s) => s.busId === busId && s.routeId === r.id),
          );
          const affectedSchedule = state.schedules.find((s) => s.busId === busId);
          const affectedStopIds = affectedSchedule?.stops.map((s) => s.stopId) ?? [];
          const disrupt = makeDisruption({
            busId,
            routeId: route?.id ?? '',
            type: 'delay',
            severity: delayMinutes >= 20 ? 'high' : delayMinutes >= 10 ? 'medium' : 'low',
            affectedStops: affectedStopIds,
            description: `${bus.registrationNumber} delayed by ${delayMinutes} min. ${note ?? ''}`.trim(),
            lat: bus.currentLat,
            lng: bus.currentLng,
            dataType: 'ACTUAL',
          });
          newDisruptions = [...state.disruptions, disrupt];
        }
      }

      return { ...state, buses: updatedBuses, disruptions: newDisruptions };
    }

    // ----------------------------------------------- driver: occupancy update
    case 'DRIVER_UPDATE_OCCUPANCY': {
      const { busId, currentOccupancy } = action.payload;
      const bus = state.buses.find((b) => b.id === busId);
      if (!bus) return state;

      const seatsAvailable = Math.max(0, bus.capacity - currentOccupancy);
      const newStatus = busStatusFromOperational(bus.operationalStatus, bus.delayMinutes, seatsAvailable);

      let newDisruptions = state.disruptions;

      // Auto-disrupt when bus becomes full
      if (seatsAvailable === 0 && bus.seatsAvailable > 0) {
        const route = state.routes.find((r) =>
          state.schedules.some((s) => s.busId === busId && s.routeId === r.id),
        );
        const affectedSchedule = state.schedules.find((s) => s.busId === busId);
        const affectedStopIds = affectedSchedule?.stops.map((s) => s.stopId) ?? [];
        const disrupt = makeDisruption({
          busId,
          routeId: route?.id ?? '',
          type: 'full',
          severity: 'medium',
          affectedStops: affectedStopIds,
          description: `${bus.registrationNumber} is now full — no seats available.`,
          lat: bus.currentLat,
          lng: bus.currentLng,
          dataType: 'ACTUAL',
        });
        newDisruptions = [...state.disruptions, disrupt];
      }

      const updatedBuses = updateBus(state.buses, busId, {
        currentOccupancy,
        seatsAvailable,
        status: newStatus,
        lastUpdatedBy: 'driver',
      });

      return { ...state, buses: updatedBuses, disruptions: newDisruptions };
    }

    // ---------------------------------------------- driver: report breakdown
    case 'DRIVER_REPORT_BREAKDOWN': {
      const { busId, note, lat, lng } = action.payload;
      const bus = state.buses.find((b) => b.id === busId);
      if (!bus) return state;

      const updatedBuses = updateBus(state.buses, busId, {
        status: 'breakdown',
        operationalStatus: 'out-of-service',
        seatsAvailable: 0,
        lastUpdatedBy: 'driver',
        note: note ?? 'Driver reported breakdown.',
        ...(lat !== undefined ? { currentLat: lat } : {}),
        ...(lng !== undefined ? { currentLng: lng } : {}),
      });

      const route = state.routes.find((r) =>
        state.schedules.some((s) => s.busId === busId && s.routeId === r.id),
      );
      const affectedSchedule = state.schedules.find((s) => s.busId === busId);
      const affectedStopIds = affectedSchedule?.stops.map((s) => s.stopId) ?? [];

      const disrupt = makeDisruption({
        busId,
        routeId: route?.id ?? '',
        type: 'breakdown',
        severity: 'critical',
        affectedStops: affectedStopIds,
        description: note ?? `${bus.registrationNumber} has broken down.`,
        lat: lat ?? bus.currentLat,
        lng: lng ?? bus.currentLng,
        dataType: 'ACTUAL',
      });

      let newToasts = state.toasts;

      // Cancel all active reminders for this bus and notify user
      const newReminders = state.reminders.map((r) => {
        if (r.busId === busId && !r.cancelled && !r.triggered) {
          const toast = makeToast(
            `🚨 ${r.busNumber} has broken down. Your reminder for ${r.stopName} has been cancelled.`,
            'error',
          );
          newToasts = [...newToasts, toast];
          return { ...r, cancelled: true, updatedDueToDisruption: true };
        }
        return r;
      });

      // Global breakdown toast
      newToasts = [
        ...newToasts,
        makeToast(
          `🚨 Breakdown reported for ${bus.registrationNumber}. Admins have been notified.`,
          'error',
        ),
      ];

      return {
        ...state,
        buses: updatedBuses,
        disruptions: [...state.disruptions, disrupt],
        reminders: newReminders,
        toasts: newToasts,
      };
    }

    // ------------------------------------------------- driver: report full
    case 'DRIVER_REPORT_FULL': {
      const { busId } = action.payload;
      const bus = state.buses.find((b) => b.id === busId);
      if (!bus) return state;

      const updatedBuses = updateBus(state.buses, busId, {
        status: 'full',
        seatsAvailable: 0,
        lastUpdatedBy: 'driver',
      });

      const route = state.routes.find((r) =>
        state.schedules.some((s) => s.busId === busId && s.routeId === r.id),
      );
      const affectedSchedule = state.schedules.find((s) => s.busId === busId);
      const affectedStopIds = affectedSchedule?.stops.map((s) => s.stopId) ?? [];

      const disrupt = makeDisruption({
        busId,
        routeId: route?.id ?? '',
        type: 'full',
        severity: 'medium',
        affectedStops: affectedStopIds,
        description: `${bus.registrationNumber} reported full — no boarding available.`,
        lat: bus.currentLat,
        lng: bus.currentLng,
        dataType: 'ACTUAL',
      });

      return {
        ...state,
        buses: updatedBuses,
        disruptions: [...state.disruptions, disrupt],
      };
    }

    // ---------------------------------------------- driver: location update
    case 'DRIVER_UPDATE_LOCATION': {
      const { busId, lat, lng } = action.payload;
      const updatedBuses = state.buses.map((b) =>
        b.id === busId
          ? { ...b, currentLat: lat, currentLng: lng, lastUpdated: new Date().toISOString(), lastUpdatedBy: 'driver' as const }
          : b,
      );
      return { ...state, buses: updatedBuses };
    }

    // --------------------------------------------------------------- hydrate
    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addToast: (message: string, type?: Toast['type']) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const saved = loadFromStorage();
    if (saved) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Check reminders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      state.reminders.forEach((reminder) => {
        if (!reminder.triggered && !reminder.cancelled) {
          const reminderMs = new Date(reminder.reminderTime).getTime();
          if (now >= reminderMs) {
            dispatch({ type: 'UPDATE_REMINDER', payload: { id: reminder.id, triggered: true } });
            dispatch({
              type: 'ADD_TOAST',
              payload: makeToast(
                `🔔 Reminder: ${reminder.busNumber} arrives at ${reminder.stopName} in ${reminder.minutesBefore} min.`,
                'info',
                8000,
              ),
            });
          }
        }
      });
    }, 30_000);

    return () => clearInterval(interval);
  }, [state.reminders]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    dispatch({ type: 'ADD_TOAST', payload: makeToast(message, type) });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, addToast }}>
      {children}
    </AppContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
