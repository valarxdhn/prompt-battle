'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/DemoContext';
import DutyControls from './DutyControls';
import OccupancyControls from './OccupancyControls';
import ReportPanel from './ReportPanel';
import StatusBadge from '../shared/StatusBadge';
import DataTypeTag from '../shared/DataTypeTag';

export default function DriverPanel() {
  const { state, dispatch, addToast } = useApp();

  const [selectedBusId, setSelectedBusId] = useState<string>(
    state.activeDriverBusId || state.buses[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'duty' | 'occupancy' | 'reports'>('duty');

  // Currently active bus
  const activeBus = state.buses.find((b) => b.id === state.activeDriverBusId);

  // Handle duty start
  const handleStartDuty = (busId: string) => {
    const bus = state.buses.find((b) => b.id === busId);
    if (!bus) return;

    dispatch({ type: 'SET_ACTIVE_DRIVER_BUS', payload: bus.id });

    // Mark driver onDuty if mapped
    if (bus.driverId) {
      dispatch({
        type: 'UPDATE_DRIVER',
        payload: { id: bus.driverId, onDuty: true },
      });
    }

    addToast(`Duty started on vehicle ${bus.registrationNumber}. GPS broadcast active.`, 'success');
  };

  // Handle duty end
  const handleEndDuty = () => {
    if (confirm('End duty shift and disconnect GPS live broadcast?')) {
      if (activeBus?.driverId) {
        dispatch({
          type: 'UPDATE_DRIVER',
          payload: { id: activeBus.driverId, onDuty: false },
        });
      }
      dispatch({ type: 'SET_ACTIVE_DRIVER_BUS', payload: null });
      addToast('Duty completed. Shift logged.', 'info');
    }
  };

  // 1. Shift Login / Duty Start Screen
  if (!activeBus) {
    return (
      <div
        style={{
          maxWidth: 520,
          margin: '32px auto',
          background: 'var(--surface, #18191c)',
          border: '1px solid var(--border, #2a2b30)',
          borderRadius: 'var(--radius, 10px)',
          padding: 24,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🚌</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px 0' }}>
            Driver & Conductor Terminal
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Select your assigned bus to broadcast live GPS telemetry, report passenger count, and log delays.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--muted)',
                marginBottom: 6,
                textTransform: 'uppercase',
              }}
            >
              Select Assigned Vehicle
            </label>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm, 6px)',
                background: 'var(--surface2, #1e1f24)',
                border: '1px solid var(--border, #2a2b30)',
                color: 'var(--text)',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {state.buses.map((bus) => {
                const driver = state.drivers.find((d) => d.id === bus.driverId);
                return (
                  <option key={bus.id} value={bus.id}>
                    {bus.registrationNumber} — {bus.type.toUpperCase()} ({bus.capacity} Seats)
                    {driver ? ` [Driver: ${driver.name}]` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={() => handleStartDuty(selectedBusId)}
            style={{
              width: '100%',
              minHeight: 52,
              borderRadius: 'var(--radius-sm, 6px)',
              background: 'var(--accent, #f4d35e)',
              color: '#171717',
              border: 'none',
              fontWeight: 800,
              fontSize: 16,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              marginTop: 10,
            }}
          >
            🟢 Start Duty & Connect Live GPS
          </button>
        </div>
      </div>
    );
  }

  // 2. Active Duty Console
  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Top Shift Status Banner */}
      <div
        style={{
          background: 'var(--surface, #18191c)',
          border: '1px solid var(--border, #2a2b30)',
          borderRadius: 'var(--radius, 10px)',
          padding: 16,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: 'var(--accent, #f4d35e)',
              }}
            >
              {activeBus.registrationNumber}
            </span>
            <StatusBadge status={activeBus.status} />
            <DataTypeTag type="ACTUAL" size="sm" />
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Duty active · Capacity: {activeBus.capacity} passengers
          </div>
        </div>

        <button
          onClick={handleEndDuty}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            background: 'rgba(224, 82, 82, 0.15)',
            border: '1px solid rgba(224, 82, 82, 0.35)',
            color: 'var(--danger)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          🛑 End Shift
        </button>
      </div>

      {/* Touch-Friendly Sub-Navigation */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => setActiveTab('duty')}
          style={{
            minHeight: 48,
            borderRadius: 8,
            border: `1px solid ${
              activeTab === 'duty' ? 'var(--accent)' : 'var(--border)'
            }`,
            background: activeTab === 'duty' ? 'var(--surface2)' : 'var(--surface)',
            color: activeTab === 'duty' ? 'var(--accent)' : 'var(--muted)',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          📍 GPS & Duty
        </button>

        <button
          onClick={() => setActiveTab('occupancy')}
          style={{
            minHeight: 48,
            borderRadius: 8,
            border: `1px solid ${
              activeTab === 'occupancy' ? 'var(--accent)' : 'var(--border)'
            }`,
            background: activeTab === 'occupancy' ? 'var(--surface2)' : 'var(--surface)',
            color: activeTab === 'occupancy' ? 'var(--accent)' : 'var(--muted)',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          👥 Passengers ({activeBus.currentOccupancy})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={{
            minHeight: 48,
            borderRadius: 8,
            border: `1px solid ${
              activeTab === 'reports' ? 'var(--accent)' : 'var(--border)'
            }`,
            background: activeTab === 'reports' ? 'var(--surface2)' : 'var(--surface)',
            color: activeTab === 'reports' ? 'var(--accent)' : 'var(--muted)',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          🚨 Incident Report
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'duty' && <DutyControls bus={activeBus} />}
      {activeTab === 'occupancy' && <OccupancyControls bus={activeBus} />}
      {activeTab === 'reports' && <ReportPanel bus={activeBus} />}
    </div>
  );
}
