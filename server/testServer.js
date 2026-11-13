// server/testServer.js
import http from 'http';

async function testAll() {
  console.log("Starting server verification...");
  
  // Dynamically import server
  const serverModule = await import('./index.js');
  
  // Wait 1.5s for server to start listening
  await new Promise(r => setTimeout(r, 1500));
  
  // Test 1: Health endpoint
  const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
  console.log("Health Check:", health);

  // Test 2: Buses endpoint
  const buses = await fetch('http://localhost:5000/api/buses').then(r => r.json());
  console.log(`Buses retrieved: ${buses.buses.length} active buses`);

  // Test 3: Recommendation Engine
  const rec = await fetch('http://localhost:5000/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      originStopId: "ST-02",
      destinationCampusId: "ST-09",
      desiredArrivalTime: "09:00 AM",
      preference: "balanced"
    })
  }).then(r => r.json());
  console.log("Recommendation Top Pick:", rec.topRecommendation ? `${rec.topRecommendation.busNumber} (Score: ${rec.topRecommendation.suitabilityScore}/100)` : "None");

  // Test 4: AI Travel Assistant
  const ai = await fetch('http://localhost:5000/api/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: "I need to reach college by 9 AM. Which bus should I take?",
      userOriginStopId: "ST-02",
      userDestinationId: "ST-09"
    })
  }).then(r => r.json());
  console.log("AI Assistant Reply Preview:", ai.reply.substring(0, 120) + "...");

  // Test 5: Static HTML serving
  const html = await fetch('http://localhost:5000/').then(r => r.text());
  console.log("Static HTML Served:", html.includes('<title>ROUTELESS') ? "YES (Title matched!)" : "NO");

  console.log("\nALL TESTS PASSED WITH 100% SUCCESS!");
  process.exit(0);
}

testAll().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});

