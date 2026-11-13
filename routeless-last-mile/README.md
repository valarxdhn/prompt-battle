# ROUTELESS (RuralLink) — Smart Rural Transport

ROUTELESS (RuralLink) is an intelligent rural transit optimization platform designed to eliminate student waiting anxiety, optimize public bus load factors, and provide reliable alternative transport options during breakdowns and schedule disruptions.

---

## 👥 Role-Based Architecture & Interfaces

The system provides three synchronized interfaces reading and writing to the **same single client-side store** with reactive state persistence and browser notification triggers:

### 1. 🎓 Student Interface (`/student`)
- **Smart Bus Search**:
  - Browser Geolocation with a "Pick a stop manually" fallback.
  - Destination selection and preferred departure time query.
  - Matches live forward route sequences and sorts results by best fit to preferred departure time.
  - Visual indicators: Bus registration, boarding stop, departure time, ETA at stop, destination arrival, operational status, seats available, crowd level badge, and data provenance tag.
- **Advance Reminders**:
  - "Remind Me" button on bus results with selectable lead times (5, 10, 15, 30 min, or custom).
  - Web Notification API integration with in-app banner fallback.
  - Dedicated Reminders management tab: list, edit lead times, cancel, preview simulated SMS alerts, and receive live disruption warnings if the bus breaks down or delays.
- **Automated Alternatives Directory**:
  - Automatically triggers when no regular bus is suitable (all buses full, delayed, or out-of-service).
  - Vetted private buses, auto-rickshaw stands, shared cabs, and taxis with contact info, response time, and fare estimates.
  - Side-by-side comparison (Cards or Table view) with sorting by cost or arrival time, and tags for "Cheapest" and "Fastest".

### 2. 🛠️ Admin Interface (`/admin`)
- **Fleet Monitor & Vehicle Registry**:
  - Register new buses, edit capacity/type, assign routes and drivers.
  - Live spatial placement matrix showing bus status, GPS coordinates, seat occupancy, and report provenance.
- **Disruption Centre**:
  - Automatic triaging of breakdowns, route congestions, and vehicle full alerts.
  - Severity classification (Critical, High, Medium, Low) with one-click dispatcher acknowledgement and resolution.
- **Driver & Conductor Accounts**:
  - Authorize and manage driver profiles, phone numbers, vehicle links, and active duty states.
- **Alternative Transport Directory**:
  - Add, edit, or adjust availability and fare ranges for local private transport providers.

### 3. 🚌 Driver & Conductor Interface (`/driver`)
- **Duty Start / Vehicle Login**:
  - Assign vehicle registration and initiate GPS telemetry streaming.
  - Manual stop calibration fallback if device GPS is denied.
- **Live Duty & Location Telemetry**:
  - Periodic location pinging with a visible "Sharing Location" heartbeat indicator.
  - One-touch Operational State toggle: Running, Delayed (with slider for delay minutes), Stopped, Out of Service.
- **Passenger Occupancy Counter**:
  - Mobile-first, large-touch `+1`, `-1`, `+5`, `-5` passenger increment controls.
  - One-tap "Mark Bus As FULL" override.
- **Incident & Emergency Reporting**:
  - One-tap Breakdown Report with optional notes and GPS coordinate logging.
  - Heavy traffic congestion reporting with estimated delay in minutes.

---

## 🔄 End-to-End Reactive Data Flow

```
+---------------------------+
| Driver / Conductor        |
| - Taps "Breakdown" or     |
| - Updates occupancy/delay |
+-------------+-------------+
              | (Dispatches to shared DemoContext store)
              v
+-----------------------------------------------------------+
| Single Shared Store (DemoContext.tsx + localStorage)      |
| - Bus status -> 'breakdown' / 'unavailable'               |
| - Disruption incident automatically generated             |
| - Affected student reminders updated with disruption flag |
| - High-priority system toast generated                    |
+-------------+-----------------------------+---------------+
              |                             |
              v                             v
+-----------------------------+  +----------------------------+
| Admin Disruption Centre     |  | Student Interface          |
| - Displays critical alert   |  | - Deprecates broken bus    |
| - Shows affected route      |  | - Shows bus in Unavailable |
| - Dispatcher can resolve/ack|  | - Auto-opens Alternatives  |
|                             |  | - Delivers browser alert   |
+-----------------------------+  +----------------------------+
```

---

## 🏷️ Data Provenance Rules (Zero Fabrication)

Every data point in ROUTELESS is explicitly tagged to maintain complete transparency:
1. `● ACTUAL`: Directly reported by on-duty drivers, conductors, or dispatch administrators via GPS and telemetry forms.
2. `◈ PREDICTED`: Computed algorithms for route matching, priority ranking, and arrival estimates.
3. `◇ SIMULATED / SAMPLE`: Seeded demo data, including mock alternative transport directory contacts, fare ranges, and baseline route timetables.

---

## 🚀 Running the Project

```bash
# Navigate to the project directory
cd routeless-last-mile

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to select a role or switch between dashboards.
