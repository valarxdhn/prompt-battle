// server/index.js
// ROUTELESS - AI-Powered Smart Student Transportation Platform
// Main Express + WebSocket Server

import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { initialRoutes, initialStops, initialSchedules } from './data/transitData.js';
import { BusSimulator } from './engine/busSimulator.js';
import { CrisisEngine } from './engine/crisisEngine.js';
import { calculatePredictedDemand, generateHeatmapMatrix } from './engine/demandPrediction.js';
import { getTravelRecommendations } from './engine/recommendationEngine.js';
import { processAssistantQuery } from './engine/aiAssistant.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data stores
const simulator = new BusSimulator();
simulator.start();
const crisisEngine = new CrisisEngine(simulator);

let routes = JSON.parse(JSON.stringify(initialRoutes));
let stops = JSON.parse(JSON.stringify(initialStops));
let schedules = JSON.parse(JSON.stringify(initialSchedules));

// WebSocket server setup
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  // Send immediate initial state
  ws.send(JSON.stringify({
    type: 'INITIAL_STATE',
    data: {
      buses: simulator.getFleet(),
      routes,
      stops,
      schedules,
      simulationRunning: simulator.simulationRunning,
      simulationSpeed: simulator.simulationSpeed,
      timestamp: new Date().toISOString()
    }
  }));

  ws.on('message', (message) => {
    try {
      const parsed = JSON.parse(message);
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (e) {
      console.error('WS message error:', e);
    }
  });
});

// Broadcast simulator updates to all connected clients
simulator.subscribe((telemetry) => {
  const message = JSON.stringify({
    type: 'TELEMETRY_UPDATE',
    data: telemetry
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
});

// ---------------- REST API ROUTES ----------------

// 1. Health check & Platform summary
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'ROUTELESS - Smart Student Transportation Platform',
    version: '1.0.0',
    activeBuses: simulator.getFleet().length,
    activeRoutes: routes.length,
    totalStops: stops.length,
    simulationSpeed: simulator.simulationSpeed,
    simulationRunning: simulator.simulationRunning
  });
});

// 2. Buses
app.get('/api/buses', (req, res) => {
  res.json({
    buses: simulator.getFleet(),
    isSimulatedGps: true,
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/buses/:id', (req, res) => {
  const bus = simulator.getBusById(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });
  res.json(bus);
});

// 3. Routes & Stops
app.get('/api/routes', (req, res) => {
  res.json(routes);
});

app.get('/api/stops', (req, res) => {
  res.json(stops);
});

// 4. Schedules
app.get('/api/schedules', (req, res) => {
  const { routeId, destination } = req.query;
  let filtered = [...schedules];
  if (routeId) {
    filtered = filtered.filter(s => s.routeId === routeId);
  }
  if (destination) {
    filtered = filtered.filter(s => s.destination.toLowerCase().includes(destination.toLowerCase()));
  }

  // Enrich with live bus occupancy if busId is active
  const liveBuses = simulator.getFleet();
  const enriched = filtered.map(sch => {
    const liveBus = liveBuses.find(b => b.id === sch.busId);
    const pred = calculatePredictedDemand({
      routeId: sch.routeId,
      departureTimeStr: sch.departureTime,
      busCapacity: liveBus ? liveBus.capacity : 52
    });

    return {
      ...sch,
      liveBus: liveBus || null,
      currentOccupancy: liveBus ? liveBus.occupancyPercentage : null,
      predictedOccupancy: pred.occupancyPercentage,
      predictedPassengers: pred.predictedPassengers,
      crowdLevel: pred.crowdLevel,
      crowdColor: pred.crowdColor,
      crowdBadge: pred.crowdBadge,
      seatsRemaining: liveBus ? Math.max(0, liveBus.capacity - liveBus.actualPassengers) : pred.estimatedSeatsRemaining
    };
  });

  res.json(enriched);
});

// 5. Crowd & Heatmap Analytics
app.get('/api/crowd/heatmaps', (req, res) => {
  const { dayOfWeek = "Wednesday", routeId = null } = req.query;
  const heatmapData = generateHeatmapMatrix({ dayOfWeek, selectedRouteId: routeId });
  res.json(heatmapData);
});

app.get('/api/crowd/predictions', (req, res) => {
  const { routeId = "R-101", departureTime = "08:15 AM", dayOfWeek = "Wednesday", busCapacity = 52 } = req.query;
  const prediction = calculatePredictedDemand({
    routeId,
    departureTimeStr: departureTime,
    dayOfWeek,
    busCapacity: parseInt(busCapacity, 10)
  });
  res.json(prediction);
});

// 6. Smart Travel Recommendation Engine
app.post('/api/recommend', (req, res) => {
  const { originStopId, destinationCampusId, desiredArrivalTime, preference } = req.body;
  const recommendations = getTravelRecommendations({
    originStopId,
    destinationCampusId,
    desiredArrivalTime,
    preference,
    buses: simulator.getFleet(),
    schedules
  });
  res.json(recommendations);
});

// 7. Personal AI Travel Assistant
app.post('/api/assistant/chat', async (req, res) => {
  const { query, conversationHistory, userOriginStopId, userDestinationId } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const result = await processAssistantQuery({
      query,
      conversationHistory,
      simulator,
      schedules,
      userOriginStopId,
      userDestinationId
    });
    res.json(result);
  } catch (err) {
    console.error('AI Assistant Error:', err);
    res.status(500).json({ error: 'Failed to process AI query', details: err.message });
  }
});

// 8. Admin APIs
// Add bus
app.post('/api/admin/buses', (req, res) => {
  const newBus = simulator.addBus(req.body);
  res.status(201).json(newBus);
});

// Update bus details or delay
app.put('/api/admin/buses/:id', (req, res) => {
  const { delayMinutes, actualPassengers } = req.body;
  let bus = simulator.getBusById(req.params.id);
  if (!bus) return res.status(404).json({ error: 'Bus not found' });

  if (delayMinutes !== undefined) {
    bus = simulator.updateBusDelay(req.params.id, delayMinutes);
  }
  if (actualPassengers !== undefined) {
    bus = simulator.updatePassengerCount(req.params.id, actualPassengers);
  }

  res.json(bus);
});

// Delete bus
app.delete('/api/admin/buses/:id', (req, res) => {
  const removed = simulator.removeBus(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Bus not found' });
  res.json({ message: 'Bus removed', bus: removed });
});

// Conductor / Sensor Passenger Counter update
app.post('/api/admin/passenger-count', (req, res) => {
  const { busId, actualPassengers } = req.body;
  if (!busId || actualPassengers === undefined) {
    return res.status(400).json({ error: 'busId and actualPassengers are required' });
  }
  const updatedBus = simulator.updatePassengerCount(busId, actualPassengers);
  if (!updatedBus) return res.status(404).json({ error: 'Bus not found' });
  res.json({ message: 'Passenger count updated successfully', bus: updatedBus });
});

// Simulation speed / pause controls
app.post('/api/admin/simulation', (req, res) => {
  const { action, speed } = req.body;
  if (action === 'TOGGLE_PAUSE') {
    const running = simulator.togglePause();
    return res.json({ simulationRunning: running });
  }
  if (action === 'SET_SPEED' && speed !== undefined) {
    simulator.setSpeed(parseFloat(speed));
    return res.json({ simulationSpeed: simulator.simulationSpeed });
  }
  if (action === 'RESET') {
    simulator.resetFleet();
    return res.json({ message: 'Fleet reset to origin terminals' });
  }
  res.status(400).json({ error: 'Invalid action' });
});

// Add schedule
app.post('/api/admin/schedules', (req, res) => {
  const { routeId, busNumber, destination, origin, departureTime, expectedArrivalTime } = req.body;
  const newSch = {
    id: `SCH-${Date.now().toString().slice(-4)}`,
    routeId,
    busId: null,
    busNumber,
    destination,
    origin,
    departureTime,
    expectedArrivalTime,
    frequencyMinutes: 20,
    shift: "Admin Custom",
    status: "Scheduled"
  };
  schedules.push(newSch);
  res.status(201).json(newSch);
});

// Crisis Mode APIs
app.get('/api/crisis/status', (req, res) => {
  res.json(crisisEngine.getStatus());
});

app.post('/api/crisis/activate', (req, res) => {
  const status = crisisEngine.activate();
  simulator.crisisActive = true;
  res.json(status);
});

app.post('/api/crisis/deactivate', (req, res) => {
  const status = crisisEngine.deactivate();
  simulator.crisisActive = false;
  res.json(status);
});

// Serve frontend build from client/dist if present
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`[ROUTELESS] Backend & Telemetry Server running on port ${PORT}`);
});
