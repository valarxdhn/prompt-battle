// client/src/components/LiveMap.jsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Bus, MapPin, Navigation, Clock, Users, ShieldAlert, Sparkles } from 'lucide-react';
import { useTransit } from '../context/TransitContext';
import CrowdBadge from './CrowdBadge';

// Helper component to smoothly pan/zoom when a bus or route is selected
function MapController({ selectedBus, routes, selectedRoute }) {
  const map = useMap();

  useEffect(() => {
    if (selectedBus && selectedBus.currentLocation) {
      map.flyTo(selectedBus.currentLocation, 15, { duration: 1.2 });
    } else if (selectedRoute) {
      const route = routes.find(r => r.id === selectedRoute);
      if (route && route.pathCoordinates && route.pathCoordinates.length > 0) {
        const bounds = L.latLngBounds(route.pathCoordinates);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  }, [selectedBus, selectedRoute, routes, map]);

  return null;
}

// Create custom bus DivIcon
function createBusIcon(bus, isSelected, routeColor) {
  const color = routeColor || '#3b82f6';
  const isCrowded = bus.occupancyPercentage > 85;
  const statusColor = isCrowded ? '#ef4444' : (bus.occupancyPercentage > 60 ? '#f59e0b' : '#10b981');

  return L.divIcon({
    className: 'custom-bus-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
    html: `
      <div class="relative flex items-center justify-center w-11 h-11 cursor-pointer">
        <!-- Outer pulsing aura -->
        <div class="absolute inset-0 rounded-full opacity-60 animate-ping" style="background-color: ${color};"></div>
        
        <!-- Base circle -->
        <div class="relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2" 
             style="background: #0f172a; border-color: ${isSelected ? '#ffffff' : color}; box-shadow: 0 0 15px ${color}88;">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" style="color: ${color};" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
        </div>

        <!-- Occupancy pill indicator -->
        <div class="absolute -top-1 -right-1 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold text-white shadow border border-slate-900"
             style="background-color: ${statusColor};">
          ${bus.occupancyPercentage}%
        </div>
      </div>
    `
  });
}

// Create custom Stop DivIcon
function createStopIcon(stop, isCampus) {
  const bg = isCampus ? '#4f46e5' : '#1e293b';
  const border = isCampus ? '#818cf8' : '#64748b';
  const size = isCampus ? 28 : 22;

  return L.divIcon({
    className: 'custom-stop-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `
      <div class="flex items-center justify-center rounded-full border-2 shadow-md transition-transform hover:scale-125"
           style="width: ${size}px; height: ${size}px; background-color: ${bg}; border-color: ${border};">
        <div class="w-2 h-2 rounded-full ${isCampus ? 'bg-amber-300' : 'bg-white'}"></div>
      </div>
    `
  });
}

export default function LiveMap({ height = "100%", selectedStopId = null, onSelectStop = null }) {
  const { buses, routes, stops, selectedBus, setSelectedBus, selectedRoute } = useTransit();

  // Center coordinate around our transit corridor (Bangalore South / City Campus Corridor)
  const defaultCenter = [12.9450, 77.6350];
  const defaultZoom = 13;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950" style={{ height }}>
      {/* Simulation Indicator Watermark */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-slate-900/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700/80 shadow-lg pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="text-xs font-semibold text-slate-200 tracking-wide">LIVE GPS RADAR</span>
        <span className="text-[10px] text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
          SIMULATED TELEMETRY
        </span>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <MapController selectedBus={selectedBus} routes={routes} selectedRoute={selectedRoute} />

        {/* Premium Dark Theme Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Render Route Polylines */}
        {routes.map(route => {
          const isHighlighted = !selectedRoute || selectedRoute === route.id;
          return (
            <Polyline
              key={route.id}
              positions={route.pathCoordinates}
              pathOptions={{
                color: route.color || '#3b82f6',
                weight: isHighlighted ? (selectedRoute === route.id ? 6 : 4) : 2,
                opacity: isHighlighted ? 0.85 : 0.25,
                dashArray: isHighlighted ? null : '4, 8'
              }}
            />
          );
        })}

        {/* Render Bus Stop Markers */}
        {stops.map(stop => {
          const isCampus = stop.category === "College Campus";
          const isSelected = selectedStopId === stop.id;

          return (
            <Marker
              key={stop.id}
              position={stop.coordinates}
              icon={createStopIcon(stop, isCampus)}
              eventHandlers={{
                click: () => {
                  if (onSelectStop) onSelectStop(stop);
                }
              }}
            >
              <Popup>
                <div className="text-xs max-w-xs p-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`w-2 h-2 rounded-full ${isCampus ? 'bg-indigo-400' : 'bg-slate-400'}`} />
                    <span className="font-bold text-slate-100 text-sm">{stop.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mb-2 font-mono">
                    Code: {stop.code} • {stop.category}
                  </div>

                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/60 mb-2">
                    <div className="flex justify-between items-center text-[11px] mb-1">
                      <span className="text-slate-400">Student Boarding Density:</span>
                      <span className="font-semibold text-indigo-300">{stop.studentDensity}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400">Avg Peak Hour Count:</span>
                      <span className="font-mono text-emerald-400 font-bold">~{stop.peakHourAverage} students/hr</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">Colleges Connected:</span> {stop.collegesServed.join(', ')}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Render Live Bus Markers */}
        {buses.map(bus => {
          const route = routes.find(r => r.id === bus.routeId);
          const isSelected = selectedBus && selectedBus.id === bus.id;

          return (
            <Marker
              key={bus.id}
              position={bus.currentLocation || [12.95, 77.6]}
              icon={createBusIcon(bus, isSelected, route ? route.color : '#3b82f6')}
              eventHandlers={{
                click: () => {
                  setSelectedBus(bus);
                }
              }}
            >
              <Popup>
                <div className="text-xs min-w-[220px] p-1">
                  {/* Bus Header */}
                  <div className="flex items-center justify-between border-b border-slate-700/70 pb-2 mb-2">
                    <div>
                      <div className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                        <Bus className="w-4 h-4 text-indigo-400" />
                        <span>{bus.busNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{bus.fleetName}</div>
                    </div>
                    <CrowdBadge level={bus.crowdLevel} occupancy={bus.occupancyPercentage} size="sm" />
                  </div>

                  {/* Route & Destination */}
                  <div className="mb-2 text-[11px]">
                    <div className="text-slate-400">Route: <span className="text-slate-200 font-medium">{route ? route.name : bus.routeId}</span></div>
                    <div className="text-slate-400">Status: <span className="text-emerald-400 font-medium font-mono">{bus.status}</span></div>
                    <div className="text-slate-400">Speed: <span className="text-slate-200 font-mono">{bus.speedKmph} km/h</span></div>
                  </div>

                  {/* Live vs Predicted Occupancy */}
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700/80 space-y-1.5 text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-indigo-400" /> Actual Passengers:
                      </span>
                      <span className="font-bold font-mono text-slate-100">
                        {bus.actualPassengers} / {bus.capacity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" /> AI Predicted Load:
                      </span>
                      <span className="font-bold font-mono text-amber-300">
                        {bus.predictedPassengers} students
                      </span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          bus.occupancyPercentage > 85 ? 'bg-red-500' : (bus.occupancyPercentage > 60 ? 'bg-amber-500' : 'bg-emerald-500')
                        }`}
                        style={{ width: `${Math.min(100, bus.occupancyPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* ETA & Arrival */}
                  <div className="mt-2 pt-2 border-t border-slate-700/70 flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Next Stop ETA:
                    </span>
                    <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                      ~{Math.round(bus.nextStopEtaMinutes || 4)} mins
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

