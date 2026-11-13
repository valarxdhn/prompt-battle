// client/src/components/SimulationControls.jsx
import React from 'react';
import { Play, Pause, RotateCcw, FastForward, Activity } from 'lucide-react';
import { useTransit } from '../context/TransitContext';

export default function SimulationControls({ compact = false }) {
  const {
    simulationRunning,
    simulationSpeed,
    toggleSimulation,
    changeSimulationSpeed,
    resetFleet,
    connected,
    lastTelemetryTime
  } = useTransit();

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl text-xs">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800/80">
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        <span className="text-slate-300 font-medium font-mono">
          {connected ? 'LIVE TELEMETRY' : 'CONNECTING...'}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30 font-semibold tracking-wide">
          SIMULATED GPS
        </span>
      </div>

      {!compact && (
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 px-2 font-mono">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>Tick: {lastTelemetryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        </div>
      )}

      <div className="flex items-center gap-1 ml-auto">
        {/* Play / Pause */}
        <button
          onClick={toggleSimulation}
          className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors ${
            simulationRunning 
              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
          }`}
          title={simulationRunning ? "Pause GPS Simulation" : "Resume GPS Simulation"}
        >
          {simulationRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Run</span>
            </>
          )}
        </button>

        {/* Speed multi */}
        <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
          {[1, 2, 5].map((speed) => (
            <button
              key={speed}
              onClick={() => changeSimulationSpeed(speed)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all ${
                simulationSpeed === speed
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Reset Fleet */}
        <button
          onClick={resetFleet}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
          title="Reset Bus Positions to Origin Terminals"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

