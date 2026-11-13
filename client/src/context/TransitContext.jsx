// client/src/context/TransitContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { defaultBuses, defaultRoutes, defaultStops, defaultSchedules } from '../data/fallbackData';

const TransitContext = createContext();

export function TransitProvider({ children }) {
  const [buses, setBuses] = useState(defaultBuses);
  const [routes, setRoutes] = useState(defaultRoutes);
  const [stops, setStops] = useState(defaultStops);
  const [schedules, setSchedules] = useState(defaultSchedules);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isSimulated] = useState(true);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);
  const [lastTelemetryTime, setLastTelemetryTime] = useState(new Date());

  // Active view tab: 'transit' | 'crowd' | 'assistant'
  const [activeTab, setActiveTab] = useState('transit');
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Student location preferences
  const [userOriginStopId, setUserOriginStopId] = useState('ST-02'); // Sector 14 Hostel Colony
  const [userDestinationCampusId, setUserDestinationCampusId] = useState('ST-09'); // Apex Institute (AITS)

  // Crisis Mode State (Exam Day Crisis Protocol)
  const [crisisActive, setCrisisActive] = useState(false);
  const [crisisData, setCrisisData] = useState(null);
  const [hasExamToday, setHasExamToday] = useState(true);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initial fetch of static configuration
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [routesRes, stopsRes, schedulesRes, busesRes] = await Promise.all([
        fetch('/api/routes').then(r => r.json()).catch(() => []),
        fetch('/api/stops').then(r => r.json()).catch(() => []),
        fetch('/api/schedules').then(r => r.json()).catch(() => []),
        fetch('/api/buses').then(r => r.json()).catch(() => ({ buses: [] }))
      ]);

      if (routesRes && routesRes.length) setRoutes(routesRes);
      if (stopsRes && stopsRes.length) setStops(stopsRes);
      if (schedulesRes && schedulesRes.length) setSchedules(schedulesRes);
      if (busesRes && busesRes.buses) setBuses(busesRes.buses);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Connect WebSocket for real-time telemetry stream
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'INITIAL_STATE') {
            if (message.data.buses) setBuses(message.data.buses);
            if (message.data.routes) setRoutes(message.data.routes);
            if (message.data.stops) setStops(message.data.stops);
            if (message.data.schedules) setSchedules(message.data.schedules);
            setSimulationRunning(message.data.simulationRunning);
            setSimulationSpeed(message.data.simulationSpeed);
            setLastTelemetryTime(new Date());
          } else if (message.type === 'TELEMETRY_UPDATE') {
            if (message.data.buses) {
              setBuses(message.data.buses);
              // Update selectedBus reference if selected
              setSelectedBus(prev => {
                if (!prev) return null;
                return message.data.buses.find(b => b.id === prev.id) || prev;
              });
            }
            if (message.data.simulationRunning !== undefined) {
              setSimulationRunning(message.data.simulationRunning);
            }
            if (message.data.simulationSpeed !== undefined) {
              setSimulationSpeed(message.data.simulationSpeed);
            }
            setLastTelemetryTime(new Date());
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Retry connection after 3s
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn('WS error, fallback to polling if disconnected:', err);
        ws.close();
      };
    } catch (e) {
      console.warn('WebSocket init exception:', e);
    }
  }, []);

  // Polling fallback if WebSocket drops or during dev proxy issues
  useEffect(() => {
    fetchInitialData();
    connectWebSocket();

    const fallbackPollInterval = setInterval(() => {
      if (!connected) {
        fetch('/api/buses')
          .then(r => r.json())
          .then(data => {
            if (data.buses) {
              setBuses(data.buses);
              setLastTelemetryTime(new Date());
            }
          })
          .catch(() => {});
      }
    }, 2500);

    return () => {
      clearInterval(fallbackPollInterval);
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [fetchInitialData, connectWebSocket, connected]);

  // Admin and interaction handlers
  const updatePassengerCount = async (busId, actualPassengers) => {
    try {
      const res = await fetch('/api/admin/passenger-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ busId, actualPassengers })
      });
      const data = await res.json();
      if (data.bus) {
        setBuses(prev => prev.map(b => b.id === busId ? data.bus : b));
      }
      return data;
    } catch (err) {
      console.error('Error updating passenger count:', err);
    }
  };

  const updateBusDelay = async (busId, delayMinutes) => {
    try {
      const res = await fetch(`/api/admin/buses/${busId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delayMinutes })
      });
      const data = await res.json();
      if (data && data.id) {
        setBuses(prev => prev.map(b => b.id === busId ? data : b));
      }
      return data;
    } catch (err) {
      console.error('Error updating bus delay:', err);
    }
  };

  const toggleSimulation = async () => {
    try {
      const res = await fetch('/api/admin/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_PAUSE' })
      });
      const data = await res.json();
      setSimulationRunning(data.simulationRunning);
    } catch (err) {
      console.error('Error toggling simulation:', err);
    }
  };

  const changeSimulationSpeed = async (speed) => {
    try {
      const res = await fetch('/api/admin/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SET_SPEED', speed })
      });
      const data = await res.json();
      setSimulationSpeed(data.simulationSpeed);
    } catch (err) {
      console.error('Error changing simulation speed:', err);
    }
  };

  const resetFleet = async () => {
    try {
      await fetch('/api/admin/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET' })
      });
    } catch (err) {
      console.error('Error resetting fleet:', err);
    }
  };

  const addBus = async (busData) => {
    try {
      const res = await fetch('/api/admin/buses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(busData)
      });
      return await res.json();
    } catch (err) {
      console.error('Error adding bus:', err);
    }
  };

  const removeBus = async (busId) => {
    try {
      const res = await fetch(`/api/admin/buses/${busId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.error('Error removing bus:', err);
    }
  };

  const toggleCrisisMode = async () => {
    try {
      const endpoint = crisisActive ? '/api/crisis/deactivate' : '/api/crisis/activate';
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      setCrisisActive(data.isActive);
      setCrisisData(data);
      const busesRes = await fetch('/api/buses').then(r => r.json());
      if (busesRes.buses) setBuses(busesRes.buses);
    } catch (e) {
      setCrisisActive(prev => !prev);
    }
  };

  return (
    <TransitContext.Provider
      value={{
        buses,
        routes,
        stops,
        schedules,
        loading,
        connected,
        isSimulated,
        simulationRunning,
        simulationSpeed,
        lastTelemetryTime,
        activeTab,
        setActiveTab,
        selectedBus,
        setSelectedBus,
        selectedRoute,
        setSelectedRoute,
        userOriginStopId,
        setUserOriginStopId,
        userDestinationCampusId,
        setUserDestinationCampusId,
        crisisActive,
        crisisData,
        hasExamToday,
        setHasExamToday,
        toggleCrisisMode,
        updatePassengerCount,
        updateBusDelay,
        toggleSimulation,
        changeSimulationSpeed,
        resetFleet,
        addBus,
        removeBus
      }}
    >
      {children}
    </TransitContext.Provider>
  );
}

export function useTransit() {
  const context = useContext(TransitContext);
  if (!context) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return context;
}

