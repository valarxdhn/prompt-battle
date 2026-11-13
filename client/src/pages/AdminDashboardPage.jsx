// client/src/pages/AdminDashboardPage.jsx
import React, { useState } from 'react';
import { 
  Settings, 
  Bus, 
  Users, 
  Plus, 
  Trash2, 
  Clock, 
  AlertTriangle, 
  Activity, 
  CheckCircle2, 
  Play, 
  Pause, 
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import CrowdBadge from '../components/CrowdBadge';

export default function AdminDashboardPage() {
  const { 
    buses, 
    routes, 
    stops, 
    simulationRunning, 
    simulationSpeed, 
    toggleSimulation, 
    changeSimulationSpeed, 
    resetFleet,
    updatePassengerCount,
    updateBusDelay,
    addBus,
    removeBus
  } = useTransit();

  // State for Conductor Passenger Counter tool
  const [selectedCounterBusId, setSelectedCounterBusId] = useState(buses[0]?.id || 'BUS-101A');
  const [counterCount, setCounterCount] = useState(35);
  const [counterSuccess, setCounterSuccess] = useState(false);

  // State for Add Bus Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('KA-01-EXP-7744');
  const [newFleetName, setNewFleetName] = useState('Apex Campus Superfast');
  const [newRouteId, setNewRouteId] = useState('R-101');
  const [newCapacity, setNewCapacity] = useState(52);
  const [newBusType, setNewBusType] = useState('Electric Low-Floor AC');
  const [newPassengerCount, setNewPassengerCount] = useState(15);

  const handleUpdateCount = async (e) => {
    e.preventDefault();
    await updatePassengerCount(selectedCounterBusId, counterCount);
    setCounterSuccess(true);
    setTimeout(() => setCounterSuccess(false), 2500);
  };

  const handleAddBusSubmit = async (e) => {
    e.preventDefault();
    await addBus({
      busNumber: newBusNumber,
      fleetName: newFleetName,
      routeId: newRouteId,
      capacity: newCapacity,
      busType: newBusType,
      actualPassengers: newPassengerCount
    });
    setShowAddModal(false);
  };

  const handleAddDelay = async (busId, additionalMinutes) => {
    const bus = buses.find(b => b.id === busId);
    const newDelay = (bus?.delayMinutes || 0) + additionalMinutes;
    await updateBusDelay(busId, newDelay);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Transit Dispatch & Administration Portal</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Fleet Operations & Dispatch Controller
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time management interface to add/remove buses, manually simulate sensor & conductor passenger updates, inject delay anomalies, and control GPS simulation speed.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Deploy New Bus
        </button>
      </div>

      {/* Top Controls Grid: Conductor Sensor Counter Tool & Simulation Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Conductor / Sensor Passenger Counter Tool (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Conductor / Automatic Passenger Counting (APC) Tool
                </h3>
                <p className="text-xs text-slate-400">
                  Update live passenger count on any bus to test real-time crowd level & recommendation shifts.
                </p>
              </div>
            </div>

            {counterSuccess && (
              <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl font-medium animate-in fade-in flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Broadcasted!
              </span>
            )}
          </div>

          <form onSubmit={handleUpdateCount} className="space-y-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Target Bus
                </label>
                <select
                  value={selectedCounterBusId}
                  onChange={(e) => {
                    setSelectedCounterBusId(e.target.value);
                    const b = buses.find(x => x.id === e.target.value);
                    if (b) setCounterCount(b.actualPassengers);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.busNumber} ({b.fleetName}) — Currently {b.actualPassengers}/{b.capacity}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  New Passenger Count (0 to 65)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="65"
                    value={counterCount}
                    onChange={(e) => setCounterCount(parseInt(e.target.value, 10))}
                    className="flex-1 accent-indigo-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="70"
                    value={counterCount}
                    onChange={(e) => setCounterCount(parseInt(e.target.value, 10))}
                    className="w-16 bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white text-center font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                Sync Sensor Count Now
              </button>
            </div>
          </form>
        </div>

        {/* Global Simulation & Telemetry Controls (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">GPS Telemetry Engine</h3>
              <p className="text-xs text-slate-400">Controls tick speed and reset coordinates</p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Simulation Status:</span>
              <span className={`font-mono font-bold ${simulationRunning ? 'text-emerald-400' : 'text-amber-400'}`}>
                {simulationRunning ? 'ACTIVE (Ticking)' : 'PAUSED'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Time Multiplier:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 5].map(speed => (
                  <button
                    key={speed}
                    onClick={() => changeSimulationSpeed(speed)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      simulationSpeed === speed
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <button
                onClick={toggleSimulation}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  simulationRunning 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {simulationRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {simulationRunning ? 'Pause Engine' : 'Resume Engine'}
              </button>

              <button
                onClick={resetFleet}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors flex items-center gap-1"
                title="Reset all buses back to origin terminals"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bus Fleet Management Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Fleet Inventory & Live Status</h3>
            <p className="text-xs text-slate-400">Total {buses.length} registered campus transit buses</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="p-3">Bus Info</th>
                <th className="p-3">Assigned Route</th>
                <th className="p-3">Status</th>
                <th className="p-3">Current Load</th>
                <th className="p-3">Crowd Rating</th>
                <th className="p-3">Delay</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {buses.map(bus => {
                const route = routes.find(r => r.id === bus.routeId);

                return (
                  <tr key={bus.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-3">
                      <div className="font-bold font-mono text-white text-sm">{bus.busNumber}</div>
                      <div className="text-[11px] text-slate-400">{bus.fleetName}</div>
                      <div className="text-[10px] text-slate-500">{bus.busType}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-200">
                        {route ? route.name : bus.routeId}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Speed: {bus.speedKmph} km/h
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                        bus.status === 'DELAYED' 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {bus.status}
                      </span>
                    </td>

                    <td className="p-3 font-mono">
                      <div className="font-bold text-white">
                        {bus.actualPassengers} / {bus.capacity}
                      </div>
                      <div className="text-[10px] text-amber-300">
                        AI Pred: {bus.predictedPassengers}
                      </div>
                    </td>

                    <td className="p-3">
                      <CrowdBadge level={bus.crowdLevel} occupancy={bus.occupancyPercentage} size="sm" />
                    </td>

                    <td className="p-3 font-mono">
                      {bus.delayMinutes > 0 ? (
                        <span className="text-red-400 font-bold">+{bus.delayMinutes} mins</span>
                      ) : (
                        <span className="text-emerald-400">On Time</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleAddDelay(bus.id, 5)}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30 transition-colors"
                          title="Inject +5m Traffic Delay"
                        >
                          +5m Delay
                        </button>

                        <button
                          onClick={() => removeBus(bus.id)}
                          className="p-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                          title="Remove Bus from Active Fleet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Bus */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Bus className="w-5 h-5 text-indigo-400" />
              Register & Dispatch New Bus
            </h3>

            <form onSubmit={handleAddBusSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Number</label>
                  <input
                    type="text"
                    value={newBusNumber}
                    onChange={(e) => setNewBusNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fleet Service Name</label>
                  <input
                    type="text"
                    value={newFleetName}
                    onChange={(e) => setNewFleetName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Assigned Route</label>
                  <select
                    value={newRouteId}
                    onChange={(e) => setNewRouteId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                  >
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    min="20"
                    max="80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bus Vehicle Type</label>
                <select
                  value={newBusType}
                  onChange={(e) => setNewBusType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
                >
                  <option value="Electric Low-Floor AC">Electric Low-Floor AC</option>
                  <option value="Govt Standard Student Bus">Govt Standard Student Bus</option>
                  <option value="Campus CNG Special">Campus CNG Special</option>
                  <option value="Double Decker Campus Cruiser">Double Decker Campus Cruiser</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Passengers Boarded</label>
                <input
                  type="number"
                  value={newPassengerCount}
                  onChange={(e) => setNewPassengerCount(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                  min="0"
                  max="60"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg"
                >
                  Deploy Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

