// client/src/pages/TransitView.jsx
import React, { useState } from 'react';
import { Bus, MapPin, ArrowRight, Clock, Users, Sparkles, Navigation, GitCommit, LayoutGrid, Map } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import LiveMap from '../components/LiveMap';
import RouteLineTracker from '../components/RouteLineTracker';
import CrowdBadge from '../components/CrowdBadge';

export default function TransitView() {
  const { 
    buses, 
    routes, 
    stops, 
    selectedBus, 
    setSelectedBus, 
    selectedRoute, 
    setSelectedRoute,
    userOriginStopId,
    setUserOriginStopId,
    userDestinationCampusId,
    setUserDestinationCampusId,
    setActiveTab,
    crisisActive,
    hasExamToday,
    setHasExamToday,
    toggleCrisisMode
  } = useTransit();

  const [activeRouteId, setActiveRouteId] = useState('R-101');
  const [viewMode, setViewMode] = useState('corridor'); // 'corridor' (metro-line) | 'cards' | 'map'

  const originStop = (stops && stops.length > 0)
    ? (stops.find(s => s.id === userOriginStopId) || stops[1] || stops[0])
    : { name: "Sector 14 Hostel Colony" };

  const destCampus = (stops && stops.length > 0)
    ? (stops.find(s => s.id === userDestinationCampusId) || stops[8] || stops[0])
    : { name: "Apex Institute of Tech (AITS)" };

  // Current active route object
  const currentRoute = routes.find(r => r.id === activeRouteId) || routes[0];

  // Buses running on active route
  const routeBuses = buses.filter(b => b.routeId === activeRouteId);

  // Recommended bus for user's commute
  const recommendedBus = routeBuses[0] || buses[0];

  return (
    <div className="space-y-4 pb-8">
      {/* EXAM DAY CRISIS SURPRISE HURDLE BANNER & TRIAGE ACTION */}
      {crisisActive && (
        <div className="bg-gradient-to-br from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500/80 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-rose-500/30 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>🚨 SURPRISE HURDLE: EXAM DAY CRISIS PROTOCOL ACTIVE</span>
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold border border-rose-500/30">
                ⏱️ 2 HOURS TO EXAM BELL
              </span>
              <button
                onClick={toggleCrisisMode}
                className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
              >
                Reset to Normal
              </button>
            </div>
          </div>

          {/* Grid of the 4 Crisis Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-500/30">
              <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">1. Fleet Breakdown</div>
              <div className="text-white font-mono font-bold text-sm mt-0.5">2 Buses Offline</div>
              <div className="text-[11px] text-slate-400">B-101B & B-305A Engine faults</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-500/30">
              <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">2. Road Blocked</div>
              <div className="text-white font-mono font-bold text-sm mt-0.5">Riverside Flooded</div>
              <div className="text-[11px] text-slate-400">Flash flooding cut off corridor</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-rose-500/30">
              <div className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">3. Demand Surge</div>
              <div className="text-white font-mono font-bold text-sm mt-0.5">+40% Students</div>
              <div className="text-[11px] text-slate-400">480 students rushing to exam halls</div>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/40">
              <div className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">4. AI Resolution</div>
              <div className="text-white font-mono font-bold text-sm mt-0.5">96.4% Saved on Time</div>
              <div className="text-[11px] text-emerald-300">188 of 195 stranded rescued</div>
            </div>
          </div>

          {/* Automated AI Mitigation Actions */}
          <div className="bg-slate-950/90 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5 text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Automated AI Crisis Interventions Executed:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-slate-300">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-amber-300 block">⚡ Fleet Reallocation:</strong>
                Double-Decker Bus <strong>KA-01-D-9901 (65 seats)</strong> transferred from Orbit Loop to Hostel Exam Corridor.
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-indigo-300 block">🔄 Detour Routing:</strong>
                Bypassed flooded Riverside Ring Road via <strong>Civic Center Plaza</strong> (+6m detour, 100% clear).
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-emerald-300 block">🎓 Student Priority Pass:</strong>
                Exam-goers boarded first on relief shuttles with reserved seats.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Clean Commute Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        {/* Origin / Destination selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Boarding:</span>
            <select
              value={userOriginStopId}
              onChange={(e) => setUserOriginStopId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              {stops.map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />

          <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-slate-400">Destination:</span>
            <select
              value={userDestinationCampusId}
              onChange={(e) => setUserDestinationCampusId(e.target.value)}
              className="bg-transparent text-indigo-300 font-medium focus:outline-none cursor-pointer"
            >
              {stops.filter(s => s.category === "College Campus").map(s => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Travel Recommendation Chip */}
        {recommendedBus && (
          <div 
            onClick={() => setActiveTab('assistant')}
            className="cursor-pointer flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 px-3.5 py-2 rounded-xl text-xs text-indigo-300 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            <span>
              Best Pick: <strong>{recommendedBus.busNumber}</strong> (~{Math.round(recommendedBus.nextStopEtaMinutes || 3)}m away • Seats Available)
            </span>
            <ArrowRight className="w-3 h-3 text-indigo-400 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* 2. Route Selector & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800">
        {/* Route Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {routes.map(r => (
            <button
              key={r.id}
              onClick={() => {
                setActiveRouteId(r.id);
                setSelectedRoute(r.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                activeRouteId === r.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
              <span>{r.shortName}</span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle: Stop Corridor (Default) vs Cards vs Map */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('corridor')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-medium ${
              viewMode === 'corridor' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Stop Line</span>
          </button>

          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-medium ${
              viewMode === 'cards' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Bus Cards</span>
          </button>

          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors font-medium ${
              viewMode === 'map' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Map</span>
          </button>
        </div>
      </div>

      {/* 3. Main Display Area Based on View Mode */}
      {viewMode === 'corridor' && (
        <RouteLineTracker
          route={currentRoute}
          stops={stops}
          buses={buses}
          selectedBus={selectedBus}
          onSelectBus={setSelectedBus}
          userOriginStopId={userOriginStopId}
          userDestinationCampusId={userDestinationCampusId}
        />
      )}

      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routeBuses.map(bus => (
            <div
              key={bus.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono font-bold text-base text-white">{bus.busNumber}</div>
                  <div className="text-xs text-slate-400">{bus.fleetName}</div>
                </div>
                <CrowdBadge level={bus.crowdLevel} occupancy={bus.occupancyPercentage} size="sm" />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Current Status:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{bus.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Next Stop ETA:</span>
                  <span className="font-mono text-indigo-400 font-bold">~{Math.round(bus.nextStopEtaMinutes || 3)} mins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Available Seats:</span>
                  <span className="font-mono text-white font-bold">{Math.max(0, bus.capacity - bus.actualPassengers)} open</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Speed: {bus.speedKmph} km/h</span>
                <span>Capacity: {bus.actualPassengers}/{bus.capacity}</span>
              </div>
            </div>
          ))}
          {routeBuses.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs text-slate-400">
              No active buses currently on this route.
            </div>
          )}
        </div>
      )}

      {viewMode === 'map' && (
        <div className="h-[520px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
          <LiveMap height="100%" />
        </div>
      )}
    </div>
  );
}
