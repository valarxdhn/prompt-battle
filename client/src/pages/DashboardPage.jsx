// client/src/pages/DashboardPage.jsx
import React from 'react';
import { 
  Bus, 
  MapPin, 
  Clock, 
  Users, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  Compass, 
  Flame, 
  Bot,
  CalendarCheck
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import LiveMap from '../components/LiveMap';
import CrowdBadge from '../components/CrowdBadge';
import SimulationControls from '../components/SimulationControls';

export default function DashboardPage() {
  const { 
    buses, 
    routes, 
    stops, 
    setActiveTab, 
    setSelectedBus, 
    userOriginStopId, 
    userDestinationCampusId 
  } = useTransit();

  const originStop = (stops && stops.length > 0)
    ? (stops.find(s => s.id === userOriginStopId) || stops[1] || stops[0])
    : { name: "Sector 14 Hostel Colony" };
  const destCampus = (stops && stops.length > 0)
    ? (stops.find(s => s.id === userDestinationCampusId) || stops[8] || stops[0])
    : { name: "Apex Institute of Tech (AITS)" };

  // Find next buses approaching the user's origin stop
  const upcomingBuses = (buses || []).map(bus => {
    const route = (routes || []).find(r => r.id === bus.routeId);
    return {
      ...bus,
      route
    };
  }).sort((a, b) => (a.nextStopEtaMinutes || 0) - (b.nextStopEtaMinutes || 0));

  const nextBus = upcomingBuses[0] || null;
  const secondBus = upcomingBuses[1] || null;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Greeting, Current Date, Campus Commute */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Student Transit Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good Morning, Commuter 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Tracking real-time buses from <span className="text-white font-semibold underline decoration-indigo-400">{originStop?.name || 'Sector 14 Hostel Colony'}</span> to{' '}
              <span className="text-indigo-300 font-semibold">{destCampus?.name || 'Apex Institute (AITS)'}</span>.
            </p>
          </div>

          {/* Recommended Boarding Window Pill */}
          <div className="bg-slate-950/80 backdrop-blur border border-indigo-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Recommended Boarding Time
              </div>
              <div className="text-lg font-bold text-white font-mono flex items-center gap-1.5">
                <span>07:50 AM – 08:05 AM</span>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span>🟢 Saves 20m wait time & guaranteed seat</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Simulation Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <SimulationControls compact={false} />
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Peak Period: <strong>07:30 AM – 09:30 AM</strong></span>
            <span className="text-slate-600">•</span>
            <button 
              onClick={() => setActiveTab('crowd')}
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              View Crowd Heatmap <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Next Bus Card */}
        <div 
          onClick={() => {
            if (nextBus) {
              setSelectedBus(nextBus);
              setActiveTab('tracking');
            }
          }}
          className="group cursor-pointer bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 transition-all shadow-lg hover:shadow-indigo-500/10"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Next Approaching</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              IMMINENT
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-white font-mono group-hover:text-indigo-400 transition-colors">
              {nextBus ? nextBus.busNumber : "KA-01-F-4021"}
            </div>
            <div className="text-sm font-bold text-indigo-400 font-mono">
              ~{nextBus ? Math.round(nextBus.nextStopEtaMinutes || 2) : 2} mins
            </div>
          </div>
          <div className="text-xs text-slate-300 mt-1 flex items-center justify-between">
            <span>{nextBus ? nextBus.fleetName : "Blue Express"}</span>
            <CrowdBadge level={nextBus ? nextBus.crowdLevel : "MODERATE"} occupancy={nextBus ? nextBus.occupancyPercentage : 65} size="sm" />
          </div>
        </div>

        {/* Current Crowd Condition */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Stop Crowd Status</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span className="text-amber-400">Moderate Surge</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            ~185 students expected between 08:00 - 08:30 AM at {originStop?.name?.split(' ')[0] || 'Hostels'}.
          </div>
        </div>

        {/* Active Bus Fleet */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Campus Fleet</span>
            <Bus className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {buses.length} Active <span className="text-xs text-slate-400 font-normal">on 5 routes</span>
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>● 100% scheduled service running</span>
          </div>
        </div>

        {/* AI Travel Recommendation */}
        <div 
          onClick={() => setActiveTab('assistant')}
          className="group cursor-pointer bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-indigo-500/30 hover:border-indigo-400 rounded-2xl p-5 shadow-lg transition-all"
        >
          <div className="flex items-center justify-between text-xs text-indigo-300 mb-2">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
              <Bot className="w-3.5 h-3.5" /> AI Recommendation
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="text-sm font-bold text-white leading-snug">
            "Board Bus #B-101A now or wait for #B-204 at 08:05 for less crowd."
          </div>
          <div className="text-[11px] text-indigo-300/80 mt-1">
            Tap to open conversational travel assistant ➔
          </div>
        </div>
      </div>

      {/* Main Grid: Live Radar Preview + Next Available Departure Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Live Radar Map Preview (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-ping"></div>
              <h2 className="text-base font-bold text-slate-100">Live Campus Corridor Radar</h2>
            </div>
            <button
              onClick={() => setActiveTab('tracking')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              Full Interactive Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
            <LiveMap height="100%" />
          </div>
        </div>

        {/* Next Available Buses & ETA List (5 Columns) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              Next Buses from {originStop?.name?.split(' ')[0] || 'Hostels'}
            </h2>
            <button
              onClick={() => setActiveTab('schedules')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View Full Timetable
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1">
            {upcomingBuses.slice(0, 5).map((bus, idx) => {
              const route = routes.find(r => r.id === bus.routeId);
              return (
                <div
                  key={bus.id}
                  onClick={() => {
                    setSelectedBus(bus);
                    setActiveTab('tracking');
                  }}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                    idx === 0 
                      ? 'bg-slate-900 border-indigo-500/40 shadow-md shadow-indigo-500/5' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
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
                        <span className="text-[10px] text-slate-400 font-medium">
                          {route ? route.shortName : bus.routeId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1">
                        To: <span className="font-medium text-slate-100">{bus.fleetName}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-indigo-400 font-mono">
                        ~{Math.round(bus.nextStopEtaMinutes || 4)} mins
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        ETA
                      </div>
                    </div>
                  </div>

                  {/* Occupancy and Crowd indicator */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bus.actualPassengers} / {bus.capacity} seats</span>
                      <span className="text-[10px] text-amber-300/80">
                        (AI Pred: {bus.predictedPassengers})
                      </span>
                    </div>

                    <CrowdBadge level={bus.crowdLevel} occupancy={bus.occupancyPercentage} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Assistant Quick Query Prompt Card */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/30 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Plan Your Ride with AI Routey</h3>
              <p className="text-xs text-slate-300">
                Ask when to leave, compare crowd levels, and find guaranteed seat departures.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              "Reach college by 9 AM",
              "Which bus is least crowded?",
              "Should I take next bus?",
              "Best time to travel today"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => setActiveTab('assistant')}
                className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs text-indigo-200 border border-slate-700/80 transition-all hover:scale-105"
              >
                💬 {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

