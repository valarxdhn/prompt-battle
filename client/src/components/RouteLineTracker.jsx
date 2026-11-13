// client/src/components/RouteLineTracker.jsx
import React from 'react';
import { Bus, MapPin, CheckCircle2, Clock, Users, ArrowRight, Shield, AlertTriangle } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import CrowdBadge from './CrowdBadge';

export default function RouteLineTracker({ 
  route, 
  stops, 
  buses = [], 
  selectedBus, 
  onSelectBus,
  userOriginStopId,
  userDestinationCampusId 
}) {
  const { crisisActive } = useTransit();
  if (!route) return null;

  // Get full stop objects for this route
  const routeStops = route.stops.map(stopId => {
    return stops.find(s => s.id === stopId) || { id: stopId, name: stopId, code: stopId };
  });

  // Get buses on this route
  const routeBuses = buses.filter(b => b.routeId === route.id);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
      {/* Route Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: route.color || '#3b82f6' }} />
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <span>{route.name}</span>
              <span className="text-xs font-mono font-normal text-slate-400">({route.totalDistanceKm} km)</span>
            </h3>
            <div className="text-[11px] text-slate-400">
              Corridor: {routeStops[0]?.name} ➔ {routeStops[routeStops.length - 1]?.name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Active on corridor:</span>
          <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
            {routeBuses.length} {routeBuses.length === 1 ? 'Bus' : 'Buses'}
          </span>
        </div>
      </div>

      {/* Visual Linear Stop Corridor (Metro/Subway Style) */}
      <div className="relative py-2">
        {/* Continuous Line Track */}
        <div className="absolute left-6 top-8 bottom-8 w-1 bg-slate-800 rounded-full" />

        {/* Stops Sequence */}
        <div className="space-y-6 relative">
          {routeStops.map((stop, idx) => {
            const isOrigin = stop.id === userOriginStopId;
            const isDestination = stop.id === userDestinationCampusId;
            const isCampus = stop.category === "College Campus";

            // Find buses currently at or approaching this stop
            const busesNearThisStop = routeBuses.filter(b => {
              const busStopIdx = b.currentStopIndex || 0;
              return busStopIdx === idx;
            });

            return (
              <div key={stop.id} className="relative flex items-start gap-4 group">
                {/* Stop Node Circle */}
                <div className="relative z-10 flex-shrink-0 flex items-center justify-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                    isOrigin
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                      : isDestination
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}>
                    {isDestination ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isOrigin ? (
                      <MapPin className="w-5 h-5 text-white" />
                    ) : (
                      <span className="font-mono text-xs font-semibold">{idx + 1}</span>
                    )}
                  </div>
                </div>

                {/* Stop Info & Buses at this stop */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${isOrigin || isDestination ? 'text-white font-bold' : 'text-slate-200'}`}>
                        {stop.name}
                      </span>
                      {crisisActive && (stop.id === 'ST-07' || stop.isBlocked) && (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40 font-bold flex items-center gap-1">
                          🚫 ROAD FLOODED
                        </span>
                      )}
                      {isOrigin && (
                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-semibold">
                          YOUR BOARDING STOP
                        </span>
                      )}
                      {isDestination && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                          YOUR CAMPUS GATE
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-mono text-slate-500">
                      Stop #{idx + 1}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {stop.category} • {stop.studentDensity || "Standard"} Boarding Volume
                  </div>

                  {crisisActive && (stop.id === 'ST-07' || stop.isBlocked) && (
                    <div className="mt-2 p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
                      <strong className="text-rose-300">⚠️ Flash Flood Warning:</strong> Road impassable. <strong>AI Automated Action:</strong> All transit diverted via Civic Center Bypass (+6m transit).
                    </div>
                  )}

                  {/* Active Buses Positioned at/approaching this stop */}
                  {busesNearThisStop.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {busesNearThisStop.map(bus => {
                        const isSelected = selectedBus && selectedBus.id === bus.id;

                        return (
                          <div
                            key={bus.id}
                            onClick={() => onSelectBus && onSelectBus(bus)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-wrap items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-indigo-950/60 border-indigo-500 shadow-md'
                                : 'bg-slate-950/80 border-slate-700/80 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                                <Bus className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-white text-xs">
                                    {bus.busNumber}
                                  </span>
                                  {bus.status === 'OUT_OF_SERVICE' ? (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                                      ⚠️ BROKEN DOWN
                                    </span>
                                  ) : bus.isReliefBus ? (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                      ⚡ AI RELIEF BUS
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                                      {bus.status}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  Speed: {bus.speedKmph} km/h • ETA: ~{Math.round(bus.nextStopEtaMinutes || 3)} mins
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right text-xs">
                                <div className="font-mono text-slate-200">
                                  {bus.actualPassengers}/{bus.capacity} seats
                                </div>
                                <div className="text-[10px] text-emerald-400 font-medium">
                                  {Math.max(0, bus.capacity - bus.actualPassengers)} open
                                </div>
                              </div>

                              <CrowdBadge level={bus.crowdLevel} occupancy={bus.occupancyPercentage} size="sm" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

