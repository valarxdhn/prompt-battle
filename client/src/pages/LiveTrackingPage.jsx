// client/src/pages/LiveTrackingPage.jsx
import React, { useState } from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Users, 
  Navigation, 
  Filter, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import LiveMap from '../components/LiveMap';
import CrowdBadge from '../components/CrowdBadge';
import SimulationControls from '../components/SimulationControls';

export default function LiveTrackingPage() {
  const { 
    buses, 
    routes, 
    stops, 
    selectedBus, 
    setSelectedBus, 
    selectedRoute, 
    setSelectedRoute 
  } = useTransit();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter buses by route, query, and status
  const filteredBuses = buses.filter(bus => {
    const route = routes.find(r => r.id === bus.routeId);
    const matchesRoute = !selectedRoute || bus.routeId === selectedRoute;
    const matchesQuery = 
      bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.fleetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (route && route.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || bus.status === statusFilter;
    return matchesRoute && matchesQuery && matchesStatus;
  });

  const activeBus = selectedBus || filteredBuses[0] || null;
  const activeRoute = activeBus ? routes.find(r => r.id === activeBus.routeId) : null;

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Simulation Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Bus className="w-5 h-5 text-indigo-400" />
            Live Fleet Tracking & Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time GPS coordinates, route polyline paths, stop arrivals, and passenger loads.
          </p>
        </div>

        {/* Global Simulation Bar */}
        <SimulationControls compact={false} />
      </div>

      {/* Main Layout: Filters & Bus Sidebar (4 Cols) + Live Map View (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Sidebar: Filters & Bus List */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {/* Route filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedRoute(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedRoute === null 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Routes ({buses.length})
            </button>
            {routes.map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRoute(r.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  selectedRoute === r.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                <span>{r.shortName}</span>
              </button>
            ))}
          </div>

          {/* Search bar & status filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bus #, route, destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="EN_ROUTE">En Route</option>
              <option value="APPROACHING">Approaching</option>
              <option value="AT_STOP">At Stop</option>
              <option value="BOARDING">Boarding</option>
              <option value="DELAYED">Delayed</option>
            </select>
          </div>

          {/* Bus List Cards */}
          <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
            {filteredBuses.map(bus => {
              const route = routes.find(r => r.id === bus.routeId);
              const isSelected = activeBus && activeBus.id === bus.id;

              return (
                <div
                  key={bus.id}
                  onClick={() => setSelectedBus(bus)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: route ? route.color : '#3b82f6' }}
                        />
                        <span className="font-extrabold text-white text-sm font-mono">
                          {bus.busNumber}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                          bus.status === 'DELAYED' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : bus.status === 'AT_STOP' || bus.status === 'BOARDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {bus.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 font-medium">
                        {bus.fleetName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-indigo-400 font-mono">
                        ~{Math.round(bus.nextStopEtaMinutes || 3)}m
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">ETA</div>
                    </div>
                  </div>

                  {/* Route progress and occupancy bar */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bus.actualPassengers}/{bus.capacity}</span>
                      <span className="text-slate-500 font-sans">
                        ({bus.occupancyPercentage}% full)
                      </span>
                    </div>

                    <CrowdBadge level={bus.crowdLevel} occupancy={bus.occupancyPercentage} size="sm" />
                  </div>
                </div>
              );
            })}

            {filteredBuses.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-xs">
                No active buses found matching filter criteria.
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Interactive Leaflet Map & Active Bus Inspector */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          <div className="h-[480px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
            <LiveMap height="100%" />
          </div>

          {/* Active Bus Deep Inspector Sheet */}
          {activeBus && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Bus className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-white font-mono">
                        {activeBus.busNumber}
                      </h2>
                      <span className="text-xs text-slate-400 font-medium font-sans">
                        • {activeBus.busType}
                      </span>
                    </div>
                    <div className="text-xs text-indigo-300 font-medium">
                      {activeRoute ? activeRoute.name : activeBus.routeId} • Operated by {activeBus.operator}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CrowdBadge level={activeBus.crowdLevel} occupancy={activeBus.occupancyPercentage} size="md" showDetails={true} />
                </div>
              </div>

              {/* Real-time stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Speed</div>
                  <div className="text-base font-extrabold text-white font-mono mt-0.5">
                    {activeBus.speedKmph} km/h
                  </div>
                  <div className="text-[10px] text-emerald-400">Smooth transit flow</div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Next Stop ETA</div>
                  <div className="text-base font-extrabold text-indigo-400 font-mono mt-0.5">
                    ~{Math.round(activeBus.nextStopEtaMinutes || 3)} mins
                  </div>
                  <div className="text-[10px] text-slate-400">Target Stop</div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Live Passenger Count</div>
                  <div className="text-base font-extrabold text-white font-mono mt-0.5">
                    {activeBus.actualPassengers} / {activeBus.capacity}
                  </div>
                  <div className="text-[10px] text-indigo-300">
                    {Math.max(0, activeBus.capacity - activeBus.actualPassengers)} open seats
                  </div>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> AI Forecast
                  </div>
                  <div className="text-base font-extrabold text-amber-300 font-mono mt-0.5">
                    {activeBus.predictedPassengers} students
                  </div>
                  <div className="text-[10px] text-slate-400">Predicted boarding</div>
                </div>
              </div>

              {/* Route stop sequence breadcrumbs */}
              {activeRoute && (
                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    Route Stop Progression & ETAs:
                  </div>

                  <div className="flex items-center overflow-x-auto gap-2 py-2 scrollbar-none">
                    {activeRoute.stops.map((stopId, idx) => {
                      const stop = stops.find(s => s.id === stopId);
                      const isPassed = idx < (activeBus.currentStopIndex || 0);
                      const isCurrent = idx === (activeBus.currentStopIndex || 0);

                      return (
                        <div
                          key={stopId}
                          className={`flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-xl border text-xs ${
                            isCurrent
                              ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold shadow'
                              : isPassed
                              ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            isCurrent ? 'bg-indigo-400 animate-ping' : isPassed ? 'bg-slate-600' : 'bg-emerald-400'
                          }`} />
                          <div>
                            <div className="font-medium">{stop ? stop.name.split(' ')[0] : stopId}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {isPassed ? 'Passed' : isCurrent ? `Approaching (~${Math.round(activeBus.nextStopEtaMinutes || 3)}m)` : `+${(idx - (activeBus.currentStopIndex || 0)) * 7}m`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

