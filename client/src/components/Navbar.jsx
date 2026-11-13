// client/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Bus, Bot, Flame, Sliders, MapPin, Play, Pause, RotateCcw } from 'lucide-react';
import { useTransit } from '../context/TransitContext';

export default function Navbar() {
  const { 
    activeTab, 
    setActiveTab, 
    buses, 
    simulationRunning, 
    toggleSimulation, 
    simulationSpeed, 
    changeSimulationSpeed, 
    resetFleet,
    updatePassengerCount,
    crisisActive,
    toggleCrisisMode
  } = useTransit();

  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoBusId, setDemoBusId] = useState(buses[0]?.id || 'BUS-101A');
  const [demoCount, setDemoCount] = useState(38);

  const tabs = [
    { id: 'transit', label: 'Live Map & Buses', icon: Bus },
    { id: 'crowd', label: 'Crowd Heatmap', icon: Flame },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
  ];

  const handleUpdatePassenger = (e) => {
    e.preventDefault();
    updatePassengerCount(demoBusId, demoCount);
    setShowDemoModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div 
              onClick={() => setActiveTab('transit')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow">
                <Bus className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white">ROUTELESS</span>
                <span className="hidden sm:inline text-[11px] text-slate-400 ml-2 font-normal">
                  Smart Student Transit
                </span>
              </div>
            </div>

            {/* Clean Tab Switcher */}
            <nav className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Crisis Trigger & Live Status & Presentation Demo Tools */}
            <div className="flex items-center gap-2">
              {/* Exam Day Crisis Surprise Hurdle Toggle */}
              <button
                onClick={toggleCrisisMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  crisisActive
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/40 animate-pulse border border-rose-400'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
                title="Simulate Exam Day Crisis Hurdle"
              >
                <span>🚨</span>
                <span className="hidden sm:inline font-mono">
                  {crisisActive ? 'CRISIS ACTIVE (Reset)' : 'SIMULATE CRISIS'}
                </span>
              </button>

              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono">{buses.length} Buses</span>
              </div>

              {/* Minimal Demo Controls Button */}
              <button
                onClick={() => setShowDemoModal(true)}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
                title="Presentation Demo Controls"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Clean Demo Controller Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Presentation Controls
              </h3>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Simulation Speed & Pause */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1.5 font-medium">GPS Simulation Speed</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSimulation}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 ${
                      simulationRunning 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}
                  >
                    {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {simulationRunning ? 'Pause GPS' : 'Resume GPS'}
                  </button>

                  <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                    {[1, 2, 5].map(s => (
                      <button
                        key={s}
                        onClick={() => changeSimulationSpeed(s)}
                        className={`px-2 py-1 rounded text-xs font-mono ${
                          simulationSpeed === s ? 'bg-indigo-600 text-white' : 'text-slate-400'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={resetFleet}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 rounded-lg"
                    title="Reset fleet"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Manually change passenger count to show crowd level updating live */}
              <form onSubmit={handleUpdatePassenger} className="pt-3 border-t border-slate-800 space-y-3">
                <label className="text-slate-400 block font-medium">Live Conductor / Sensor Update</label>
                <select
                  value={demoBusId}
                  onChange={(e) => setDemoBusId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>{b.busNumber} ({b.fleetName})</option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="5"
                    max="65"
                    value={demoCount}
                    onChange={(e) => setDemoCount(parseInt(e.target.value, 10))}
                    className="flex-1 accent-indigo-500"
                  />
                  <span className="font-mono font-bold text-white w-10 text-right">{demoCount}</span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                >
                  Update Live Crowd
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
