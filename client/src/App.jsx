// client/src/App.jsx
import React from 'react';
import { TransitProvider, useTransit } from './context/TransitContext';
import Navbar from './components/Navbar';
import TransitView from './pages/TransitView';
import CrowdHeatmapsPage from './pages/CrowdHeatmapsPage';
import AIAssistantPage from './pages/AIAssistantPage';

function AppContent() {
  const { activeTab } = useTransit();

  const renderActivePage = () => {
    switch (activeTab) {
      case 'transit':
        return <TransitView />;
      case 'crowd':
        return <CrowdHeatmapsPage />;
      case 'assistant':
        return <AIAssistantPage />;
      default:
        return <TransitView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5">
        {renderActivePage()}
      </main>

      <footer className="mt-auto border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <span className="font-semibold text-slate-400">ROUTELESS</span> — Smart Student Transportation Platform • 
        <span className="text-slate-400 ml-1">"Don't just track the bus. Predict the journey."</span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <TransitProvider>
      <AppContent />
    </TransitProvider>
  );
}
