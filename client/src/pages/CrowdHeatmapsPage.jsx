// client/src/pages/CrowdHeatmapsPage.jsx
import React, { useState, useEffect } from 'react';
import { Flame, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import CrowdBadge from '../components/CrowdBadge';

export default function CrowdHeatmapsPage() {
  const { routes } = useTransit();
  const [selectedDay, setSelectedDay] = useState('Wednesday');
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    setLoading(true);
    fetch(`/api/crowd/heatmaps?dayOfWeek=${selectedDay}`)
      .then(r => r.json())
      .then(data => {
        setHeatmapData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDay]);

  const getCellColor = (occupancy) => {
    if (occupancy > 90) return 'bg-rose-500 text-white';
    if (occupancy >= 75) return 'bg-amber-500 text-slate-900';
    if (occupancy >= 45) return 'bg-yellow-400 text-slate-900';
    return 'bg-emerald-500 text-slate-950';
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Day Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Passenger Crowd Heatmap
          </h2>
          <p className="text-xs text-slate-400">
            AI prediction of bus occupancy across hours of the day.
          </p>
        </div>

        {/* Day pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {daysOfWeek.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                selectedDay === day
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
          <span>Campus Route / Corridor</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> &lt;45% Low</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-yellow-400" /> 45-75% Moderate</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> 75-90% Busy</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> &gt;90% Packed</span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400 animate-pulse">
            Loading crowd matrix...
          </div>
        ) : heatmapData?.grid ? (
          <div className="overflow-x-auto pb-1">
            <table className="w-full text-center border-collapse min-w-[620px]">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-400 p-2 min-w-[130px]">Route</th>
                  {heatmapData.grid[0]?.slots.map(s => (
                    <th key={s.hourLabel} className="text-[11px] font-mono text-slate-400 p-1 font-normal">
                      {s.hourLabel}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {heatmapData.grid.map(row => (
                  <tr key={row.routeId} className="hover:bg-slate-800/20">
                    <td className="text-left py-2.5 px-2 text-xs font-medium text-slate-200">
                      {row.routeName}
                    </td>

                    {row.slots.map(slot => (
                      <td key={slot.hourLabel} className="p-1">
                        <div
                          onMouseEnter={() => setHoveredCell({ ...slot, routeName: row.routeName })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className={`w-8 h-7 mx-auto rounded-md flex items-center justify-center font-mono font-semibold text-[10px] cursor-pointer transition-transform hover:scale-110 ${getCellColor(slot.predictedOccupancy)}`}
                        >
                          {slot.predictedOccupancy}%
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {/* Hover inspector */}
        {hoveredCell && (
          <div className="mt-3 p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
            <div>
              <strong className="text-white">{hoveredCell.routeName}</strong> at <span className="font-mono text-indigo-400">{hoveredCell.hourLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Expected: <strong className="text-white font-mono">{hoveredCell.predictedPassengers} students</strong></span>
              <CrowdBadge level={hoveredCell.crowdLevel} occupancy={hoveredCell.predictedOccupancy} size="sm" />
            </div>
          </div>
        )}
      </div>

      {/* Two Clean Takeaway Cards: Best Window & Peak Warning */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recommended window */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              Best Time to Board Today
            </div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              07:30 AM – 08:00 AM (or after 09:15 AM)
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Average fleet occupancy is below 40%. Guaranteed seats and minimum stop dwell time.
            </p>
          </div>
        </div>

        {/* Peak rush warning */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wide">
              Peak Rush to Avoid
            </div>
            <div className="text-sm font-bold text-white mt-0.5 font-mono">
              08:15 AM – 08:45 AM
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Over 95% occupancy across main hostel corridors. Expect standing only and boarding delays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
