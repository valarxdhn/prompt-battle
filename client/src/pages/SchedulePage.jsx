// client/src/pages/SchedulePage.jsx
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Bus, 
  MapPin, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Bot,
  AlertTriangle 
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import CrowdBadge from '../components/CrowdBadge';

export default function SchedulePage() {
  const { schedules, routes, buses, setActiveTab, setSelectedBus } = useTransit();

  const [searchDestination, setSearchDestination] = useState('');
  const [selectedRouteFilter, setSelectedRouteFilter] = useState('ALL');
  const [selectedShift, setSelectedShift] = useState('ALL');

  // Chronologically sort schedules by departure time
  const sortedSchedules = [...schedules].sort((a, b) => {
    return a.departureTime.localeCompare(b.departureTime);
  });

  const filteredSchedules = sortedSchedules.filter(sch => {
    const matchesDest = 
      sch.destination.toLowerCase().includes(searchDestination.toLowerCase()) ||
      sch.origin.toLowerCase().includes(searchDestination.toLowerCase()) ||
      sch.busNumber.toLowerCase().includes(searchDestination.toLowerCase());
    const matchesRoute = selectedRouteFilter === 'ALL' || sch.routeId === selectedRouteFilter;
    const matchesShift = selectedShift === 'ALL' || sch.shift === selectedShift;
    return matchesDest && matchesRoute && matchesShift;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Chronological Student Transit Timetable</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Bus Departures & Boarding Schedules
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live and predicted departure schedules for educational institutions. Organized chronologically to help you pick the least crowded, on-time bus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Total Daily Trips</div>
              <div className="text-xl font-bold font-mono text-white">{schedules.length} departures</div>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono font-bold">Frequency</div>
              <div className="text-xl font-bold font-mono text-indigo-400">15 – 25 mins</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Destination Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search college destination, bus number, or boarding stop..."
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Route Filter */}
          <select
            value={selectedRouteFilter}
            onChange={(e) => setSelectedRouteFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Routes</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>{r.shortName}</option>
            ))}
          </select>

          {/* Shift Filter */}
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Shifts</option>
            <option value="Morning Peak">Morning Peak (7:30 - 9:30 AM)</option>
            <option value="Mid-Morning">Mid-Morning</option>
            <option value="Afternoon">Afternoon</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing <strong>{filteredSchedules.length}</strong> scheduled trips
        </div>
      </div>

      {/* Schedule Table Cards */}
      <div className="space-y-3">
        {filteredSchedules.map((sch, index) => {
          const route = routes.find(r => r.id === sch.routeId);
          const liveBus = buses.find(b => b.id === sch.busId);
          const isLive = Boolean(liveBus);

          // Find the next scheduled bus on the same route for comparison
          const nextBusInLine = filteredSchedules.find((s, idx) => idx > index && s.routeId === sch.routeId);

          return (
            <div
              key={sch.id}
              className={`rounded-2xl border transition-all p-5 shadow-lg ${
                isLive 
                  ? 'bg-slate-900 border-indigo-500/40 hover:border-indigo-500/70' 
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Time & Route Info (3 Cols) */}
                <div className="md:col-span-3 flex items-start gap-3">
                  <div className="text-center bg-slate-950 p-2.5 rounded-xl border border-slate-800 min-w-[76px]">
                    <div className="text-xs text-slate-400 font-medium">Departs</div>
                    <div className="text-base font-extrabold text-white font-mono mt-0.5">
                      {sch.departureTime}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: route ? route.color : '#3b82f6' }}
                      />
                      <span className="font-extrabold text-white text-sm font-mono">
                        {sch.busNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 font-medium">
                      {route ? route.name : sch.routeId}
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          LIVE ON ROAD
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                          SCHEDULED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Journey Corridor (4 Cols) */}
                <div className="md:col-span-4 flex flex-col justify-center space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="text-slate-400">From:</span>
                    <span className="font-semibold text-slate-100 truncate">{sch.origin}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-slate-400">To:</span>
                    <span className="font-semibold text-emerald-300 truncate">{sch.destination}</span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono pt-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>Est. Arrival: <strong className="text-slate-200">{sch.expectedArrivalTime}</strong></span>
                    <span>(~{route ? route.estimatedNormalDurationMins : 35} mins)</span>
                  </div>
                </div>

                {/* Capacity & Predicted Crowd (3 Cols) */}
                <div className="md:col-span-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> AI Expected Crowd:
                    </span>
                    <CrowdBadge 
                      level={sch.crowdLevel || (isLive ? liveBus.crowdLevel : "MODERATE")} 
                      occupancy={sch.predictedOccupancy || 68} 
                      size="sm" 
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span className="text-[11px] text-slate-400">Remaining Seats:</span>
                    <span className="font-bold text-emerald-400">
                      ~{sch.seatsRemaining !== undefined ? sch.seatsRemaining : 16} seats left
                    </span>
                  </div>

                  {nextBusInLine && (
                    <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 truncate">
                      Next Bus: <strong>{nextBusInLine.busNumber}</strong> at {nextBusInLine.departureTime}
                    </div>
                  )}
                </div>

                {/* Action Buttons (2 Cols) */}
                <div className="md:col-span-2 flex flex-col gap-2 justify-center">
                  {isLive && (
                    <button
                      onClick={() => {
                        setSelectedBus(liveBus);
                        setActiveTab('tracking');
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Bus className="w-3.5 h-3.5" />
                      Track Live
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('assistant')}
                    className="w-full py-1.5 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 font-medium text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <Bot className="w-3 h-3 text-indigo-400" />
                    Ask Routey
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

