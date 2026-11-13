'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/DemoContext';
import type { Bus } from '../../types';

interface ReportPanelProps {
  bus: Bus;
}

export default function ReportPanel({ bus }: ReportPanelProps) {
  const { dispatch, addToast } = useApp();

  const [breakdownNote, setBreakdownNote] = useState('');
  const [trafficDelayMin, setTrafficDelayMin] = useState(15);
  const [trafficNote, setTrafficNote] = useState('');
  const [generalNote, setGeneralNote] = useState('');
  const [lastReportedFeedback, setLastReportedFeedback] = useState<string | null>(null);

  // Trigger Breakdown: Sets status to breakdown, operationalStatus out-of-service, adds critical disruption
  const handleBreakdown = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !confirm(
        `Are you sure you want to report a BREAKDOWN for ${bus.registrationNumber}? This will immediately mark the bus unavailable across the Student Search and Admin Fleet.`
      )
    ) {
      return;
    }

    dispatch({
      type: 'DRIVER_REPORT_BREAKDOWN',
      payload: {
        busId: bus.id,
        note: breakdownNote.trim() || 'Mechanical fault reported by driver',
        lat: bus.currentLat,
        lng: bus.currentLng,
      },
    });

    setLastReportedFeedback(`🚨 Breakdown reported at ${new Date().toLocaleTimeString()}`);
    addToast(
      `CRITICAL: Breakdown recorded for ${bus.registrationNumber}. Alternative alerts dispatched.`,
      'error'
    );
    setBreakdownNote('');
  };

  // Trigger Traffic Delay
  const handleTrafficReport = (e: React.FormEvent) => {
    e.preventDefault();

    dispatch({
      type: 'DRIVER_UPDATE_STATUS',
      payload: {
        busId: bus.id,
        operationalStatus: 'delayed',
        delayMinutes: Number(trafficDelayMin),
        note: trafficNote.trim() || `Traffic blockage (+${trafficDelayMin}m)`,
      },
    });

    setLastReportedFeedback(`⚠️ Traffic delay reported at ${new Date().toLocaleTimeString()}`);
    addToast(`Traffic delay of +${trafficDelayMin}m broadcast to dispatch`, 'warning');
    setTrafficNote('');
  };

  // General Dispatch Note
  const handleGeneralNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generalNote.trim()) return;

    dispatch({
      type: 'UPDATE_BUS',
      payload: {
        id: bus.id,
        note: generalNote.trim(),
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: 'driver',
      },
    });

    setLastReportedFeedback(`💬 Note broadcast at ${new Date().toLocaleTimeString()}`);
    addToast('Dispatch note updated', 'info');
    setGeneralNote('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Feedback banner */}
      {lastReportedFeedback && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: 'var(--surface2, #1e1f24)',
            border: '1px solid var(--border, #2a2b30)',
            color: 'var(--accent, #f4d35e)',
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {lastReportedFeedback}
        </div>
      )}

      {/* 1. Critical Breakdown Report */}
      <div
        style={{
          background: 'rgba(224, 82, 82, 0.08)',
          border: '1px solid rgba(224, 82, 82, 0.4)',
          borderRadius: 'var(--radius, 10px)',
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>🔧</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--danger)' }}>
            Emergency: Vehicle Breakdown
          </h3>
        </div>
        <p style={{ margin: '0 0 12px 0', fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>
          Reporting a breakdown marks this bus as <strong style={{ color: 'var(--text)' }}>UNAVAILABLE</strong>.
          It will trigger automated alternatives recommendation for students and log an incident for the dispatcher.
        </p>

        <form onSubmit={handleBreakdown}>
          <input
            type="text"
            placeholder="Fault details (e.g. Engine overheat, Flat tyre)..."
            value={breakdownNote}
            onChange={(e) => setBreakdownNote(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              background: 'var(--surface, #18191c)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: 13,
              marginBottom: 10,
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              minHeight: 48,
              borderRadius: 8,
              background: 'var(--danger)',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            🚨 Confirm Breakdown (Broadcast Actual Disruption)
          </button>
        </form>
      </div>

      {/* 2. Traffic Congestion & Delay Report */}
      <div
        style={{
          background: 'rgba(244, 164, 53, 0.08)',
          border: '1px solid rgba(244, 164, 53, 0.35)',
          borderRadius: 'var(--radius, 10px)',
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 22 }}>🚦</span>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: 'var(--warning)' }}>
            Report Heavy Traffic / Route Delay
          </h3>
        </div>

        <form onSubmit={handleTrafficReport}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Estimated Delay:</span>
            <select
              value={trafficDelayMin}
              onChange={(e) => setTrafficDelayMin(Number(e.target.value))}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 6,
                background: 'var(--surface, #18191c)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <option value="5">+5 Minutes (Minor choke)</option>
              <option value="10">+10 Minutes</option>
              <option value="15">+15 Minutes (Railway crossing / Market traffic)</option>
              <option value="25">+25 Minutes (Accident / Construction)</option>
              <option value="40">+40 Minutes (Severe gridlock)</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Cause or location (e.g. Market Square congestion)..."
            value={trafficNote}
            onChange={(e) => setTrafficNote(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 6,
              background: 'var(--surface, #18191c)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: 13,
              marginBottom: 10,
            }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              minHeight: 44,
              borderRadius: 8,
              background: 'var(--warning)',
              border: 'none',
              color: '#000',
              fontSize: 13,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Broadcast Delay To Students
          </button>
        </form>
      </div>

      {/* 3. General Conductor Broadcast */}
      <div
        style={{
          background: 'var(--surface2, #1e1f24)',
          border: '1px solid var(--border, #2a2b30)',
          borderRadius: 'var(--radius, 10px)',
          padding: 16,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
          💬 Conductor Status Broadcast
        </div>
        <form onSubmit={handleGeneralNote} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            placeholder="Notice for passengers (e.g. Stopping at College Gate)..."
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: 13,
            }}
          />
          <button
            type="submit"
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
}
