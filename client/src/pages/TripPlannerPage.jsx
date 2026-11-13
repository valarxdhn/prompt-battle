// client/src/pages/TripPlannerPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Bus, 
  Users, 
  ShieldCheck, 
  Award, 
  Compass, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  Star
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import CrowdBadge from '../components/CrowdBadge';

export default function TripPlannerPage() {
  const { 
    stops, 
    routes, 
    userOriginStopId, 
    userDestinationCampusId, 
    setSelectedBus, 
    setActiveTab 
  } = useTransit();

  const [originStopId, setOriginStopId] = useState(userOriginStopId || 'ST-02');
  const [destinationCampusId, setDestinationCampusId] = useState(userDestinationCampusId || 'ST-09');
  const [desiredArrivalTime, setDesiredArrivalTime] = useState('09:00 AM');
  const [preference, setPreference] = useState('balanced');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originStopId,
          destinationCampusId,
          desiredArrivalTime,
          preference
        })
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [originStopId, destinationCampusId, desiredArrivalTime, preference]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Journey Optimization</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Smart Travel Recommendation Engine
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Calculates the optimal bus by balancing desired arrival time, real-time delays, predicted seat occupancy, and waiting intervals.
          </p>
        </div>
      </div>

      {/* Input Form Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          Trip Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Boarding Point */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              Boarding Stop
            </label>
            <select
              value={originStopId}
              onChange={(e) => setOriginStopId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {stops.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Destination Campus */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              Destination College Gate
            </label>
            <select
              value={destinationCampusId}
              onChange={(e) => setDestinationCampusId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {stops.filter(s => s.category === "College Campus").map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Desired Arrival Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Class / Reporting Time
            </label>
            <select
              value={desiredArrivalTime}
              onChange={(e) => setDesiredArrivalTime(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="08:00 AM">08:00 AM (Early Lab)</option>
              <option value="08:30 AM">08:30 AM (Morning Shift)</option>
              <option value="09:00 AM">09:00 AM (Standard First Period)</option>
              <option value="09:30 AM">09:30 AM (Late Batch)</option>
              <option value="10:00 AM">10:00 AM (Mid-Morning Session)</option>
            </select>
          </div>

          {/* Travel Preference */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Optimization Preference
            </label>
            <select
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="balanced">Balanced (Punctual + Moderate Crowd)</option>
              <option value="least_crowded">Least Crowded (Seat Guarantee)</option>
              <option value="fastest">Fastest Transit (Express)</option>
              <option value="guaranteed_seat">Guaranteed Seating Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results View */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs animate-pulse">
          Evaluating fleet suitability scores and crowd risks...
        </div>
      ) : recommendations ? (
        <div className="space-y-6">
          {/* Top Recommendation Highlight Card */}
          {recommendations.topRecommendation && (
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-indigo-950/70 border-2 border-indigo-500/60 p-6 sm:p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-300" />
                    Top Ranked Recommendation
                  </span>
                  <span className="text-xs text-slate-400">
                    Highest Suitability Index
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Suitability Score</div>
                    <div className="text-2xl font-black text-emerald-400 font-mono">
                      {recommendations.topRecommendation.suitabilityScore} / 100
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Bus Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-white font-mono">
                        {recommendations.topRecommendation.busNumber}
                      </div>
                      <div className="text-xs text-slate-300">
                        {recommendations.topRecommendation.routeName}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {recommendations.topRecommendation.tags.map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-semibold">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Timing Comparison (5 Cols) */}
                <div className="md:col-span-5 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Boarding Time:</span>
                    <span className="font-bold text-white font-mono text-sm">
                      {recommendations.topRecommendation.boardTimeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Estimated Campus Arrival:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {recommendations.topRecommendation.arrivalTimeStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                    <span className="text-slate-400">Arrival Buffer:</span>
                    <span className="text-indigo-300 font-semibold">
                      ~{Math.max(5, recommendations.topRecommendation.timeMarginMinutes || 15)} mins before class
                    </span>
                  </div>
                </div>

                {/* Crowd & Seating (3 Cols) */}
                <div className="md:col-span-3 text-center md:text-right space-y-2">
                  <div>
                    <div className="text-[11px] text-slate-400 mb-1">Expected Crowd Level</div>
                    <CrowdBadge 
                      level={recommendations.topRecommendation.crowdLevel} 
                      occupancy={recommendations.topRecommendation.predictedOccupancy} 
                      size="md" 
                    />
                  </div>

                  <div className="text-xs text-slate-300 font-mono">
                    ~{recommendations.topRecommendation.predictedPassengers} students expected
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alternative Ranked Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              Other Candidate Departures (Ranked by Suitability)
            </h3>

            <div className="space-y-3">
              {recommendations.allOptions.slice(1).map((opt, idx) => (
                <div
                  key={opt.busId || idx}
                  className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-mono font-bold text-xs">
                        #{idx + 2}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono text-sm">
                            {opt.busNumber}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            • {opt.routeName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Board: <strong className="text-slate-200 font-mono">{opt.boardTimeStr}</strong> ➔ Reach: <strong className="text-slate-200 font-mono">{opt.arrivalTimeStr}</strong> (~{opt.journeyDurationMins}m journey)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-mono">Suitability</div>
                        <div className="text-sm font-bold text-slate-200 font-mono">
                          {opt.suitabilityScore}/100
                        </div>
                      </div>

                      <CrowdBadge level={opt.crowdLevel} occupancy={opt.predictedOccupancy} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

