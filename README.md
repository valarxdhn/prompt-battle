# ROUTELESS — AI-Powered Smart Student Transportation Platform

> **"Don't just track the bus. Predict the journey."**

ROUTELESS is an intelligent, full-stack transportation platform designed primarily for students who rely on public and government buses to travel to colleges, technical institutes, and educational campuses. Rather than acting as a simple GPS dot tracker, ROUTELESS functions as a **complete transportation intelligence system** that helps students decide **WHEN to board**, **WHICH bus to take**, and **HOW CROWDED it is likely to be**.

---

## 🚀 Key System Features

### 1. 🗺️ Live Bus Tracking System
- **Real-Time GPS Radar:** Interactive dark-mode map (powered by Leaflet & CartoDB Dark Matter) displaying all registered buses and route polylines.
- **Route & Stop Progression:** Displays stops, campus gates, boarding hubs, and live distance/ETA countdowns.
- **Dynamic Bus Status:** Real-time state transitions between `EN_ROUTE`, `APPROACHING`, `AT_STOP`, `BOARDING`, and `DELAYED`.
- **GPS Simulation Engine:** High-precision physics simulator with realistic movement along polyline paths, dwelling at stops, dwell countdowns, and passenger exchange.
- **Clearly Identified Simulated Data:** Dedicated badges and controls for transparency.

### 2. 📅 Bus Departure & Boarding Timetable
- **Chronological Departure Board:** Organizes scheduled trips by time to help students identify the best bus.
- **Comprehensive Trip Metadata:** Bus number, destination campus, departure time, boarding stop, estimated arrival time, and frequency.
- **Live vs. Predicted Occupancy:** Clear indicators showing conductor/sensor reported passenger counts alongside AI predicted boarding numbers.
- **Available Capacity Meter:** Displays remaining open seats vs standing capacity.
- **Direct Action Links:** "Track on Map" and "Ask AI Routey About This Bus" buttons.

### 3. 🧠 AI-Based Student Demand Prediction
- **Multi-Factor Forecasting Model:**
  - **Base Route Factor:** Accounts for major student transit corridors (e.g., Hostel-to-Campus Express vs Suburban loop).
  - **Bimodal Time-of-Day Curve:** Models college opening rush (07:30 - 09:30 AM), lunch/lab releases (12:30 - 02:00 PM), and evening return surge (03:30 - 05:45 PM).
  - **Day-of-Week Multiplier:** Monday morning surge (+22%), Friday evening rush (+15%), Saturday light schedule, Sunday minimum.
  - **Academic Calendar Modifier:** Regular classes vs exam week (strict simultaneous reporting) vs vacation.
  - **Weather Modifier:** Accounts for rain shifting students from two-wheelers to public transit.
- **Predictive Metrics Output:**
  - Estimated passenger count.
  - Predicted bus occupancy percentage.
  - Crowd level category: Low (Green), Moderate (Yellow), High (Orange), Extreme Rush (Red).
  - High demand surge probability and prediction confidence score.

### 4. 🔥 Peak & Low-Crowd Heatmaps
- **2D Interactive Demand Matrix:** Visual grid of hours of the day (06:00 to 20:00) across all campus routes and days of the week.
- **Hover Inspection:** Instant popover with exact student boarding counts, occupancy rates, and crowd ratings.
- **Busiest Stops Ranking:** Checkpoints with highest boarding pressure (e.g., Sector 14 Hostel Colony, Central Metro Junction).
- **Recommended Low-Crowd Windows:** Identifies early morning advantage windows (07:15 - 07:45 AM) and post-surge slots (09:05 - 09:40 AM) to save ~25 mins wait time with guaranteed seating.

### 5. 🤖 Personal AI Travel Assistant ("Routey")
- **Conversational Transportation Advisor:** Analyzes live bus locations, timetables, crowd models, and delays to provide reasoned travel advice.
- **Answers Crucial Student Inquiries:**
  - *"I need to reach college by 9 AM. Which bus should I take?"*
  - *"Which bus will be less crowded?"*
  - *"How many students are expected on the 8:30 bus?"*
  - *"Should I take the next bus or wait for another one?"*
  - *"When is the least crowded time to travel?"*
  - *"Which bus will reach my destination earlier?"*
- **Zero-Hallucination & Ground-Truth Context:** References actual platform data without inventing false bus numbers or timings.
- **One-Tap Prompt Chips & Follow-Up Suggestions.**
- **Dual Intelligence Architecture:** Deterministic real-time RAG engine with optional Gemini API integration (`GEMINI_API_KEY`).

### 6. 🎯 Smart Travel Recommendation Engine
- **Multi-Objective Scoring:** Evaluates candidate buses using a composite suitability index (0 - 100) balancing:
  - Punctuality & arrival buffer before class.
  - Crowd penalties & seating probability.
  - Travel duration & delay risk.
  - User preference (Balanced, Least Crowded, Fastest Transit, Guaranteed Seat).
- **Ranked Alternatives:** Shows top recommendation with full rationale and alternative ranked options.

### 7. ⚙️ Fleet Dispatch & Admin Dashboard
- **Fleet Inventory Table:** Add new buses, update delays, remove vehicles, monitor real-time speeds.
- **Conductor / Sensor APC Tool:** Manually update passenger count on any live bus and observe instant WebSocket telemetry updates.
- **Simulation Controls:** Pause, resume, 1x/2x/5x speed multiplier, and reset fleet to origin terminals.

---

## 🏗️ Architecture & Tech Stack

```
routeless/
├── server/
│   ├── data/
│   │   └── transitData.js          # Routes, stops, initial fleet, schedules
│   ├── engine/
│   │   ├── busSimulator.js         # GPS interpolation & telemetry state machine
│   │   ├── demandPrediction.js     # Mathematical forecasting & heatmap matrix
│   │   ├── recommendationEngine.js # Suitability scoring & ranking
│   │   └── aiAssistant.js          # Contextual conversational advisor
│   ├── index.js                    # Express REST API + WebSocket server
│   └── testServer.js               # Integration test suite
│
├── client/
│   ├── src/
│   │   ├── components/             # LiveMap, Navbar, CrowdBadge, SimulationControls
│   │   ├── context/TransitContext.jsx # Central state & WebSocket subscriber
│   │   ├── pages/                  # Dashboard, Tracking, Schedules, Heatmaps, AI, Planner, Admin
│   │   ├── App.jsx
│   │   └── index.css               # Tailwind directives & dark theme styling
│   ├── vite.config.js
│   └── tailwind.config.js
└── package.json
```

---

## 🏃 Running the Application

### 1. Production Mode (Single Port 5000)
The client is pre-built into `client/dist`. The Node.js Express server automatically serves both the REST API, WebSockets, and the frontend:

```bash
npm start
```
Then open your browser to **`http://localhost:5000`**.

### 2. Development Mode
To run Vite with Hot Module Reloading (HMR) and backend nodemon concurrently:

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```
Open **`http://localhost:3000`**.

---

## 🧪 Testing Verification

You can verify the backend API, simulation engine, and recommendation services anytime by running:

```bash
node server/testServer.js
```
Expected output:
```
Health Check: { status: 'ONLINE', activeBuses: 7, activeRoutes: 5, totalStops: 12 ... }
Buses retrieved: 7 active buses
Recommendation Top Pick: KA-01-F-4021 (Score: 69/100)
AI Assistant Reply Preview: ### 🎯 Travel Recommendation ...
Static HTML Served: YES
ALL TESTS PASSED WITH 100% SUCCESS!
```

