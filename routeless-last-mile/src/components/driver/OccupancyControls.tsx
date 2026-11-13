'use client';

import React from 'react';
import { useApp } from '../../context/DemoContext';
import type { Bus } from '../../types';
import CrowdBadge from '../shared/CrowdBadge';
import { crowdLevelFromOccupancy } from '../../utils/helpers';

interface OccupancyControlsProps {
  bus: Bus;
}

export default function OccupancyControls({ bus }: OccupancyControlsProps) {
  const { dispatch, addToast } = useApp();

  const crowdLevel = crowdLevelFromOccupancy(bus.currentOccupancy, bus.capacity);
  const percent = Math.round((bus.currentOccupancy / bus.capacity) * 100);

  const updateOccupancy = (newCount: number) => {
    const clamped = Math.max(0, Math.min(bus.capacity, newCount));
    dispatch({
      type: 'DRIVER_UPDATE_OCCUPANCY',
      payload: {
        busId: bus.id,
        currentOccupancy: clamped,
      },
    });
  };

  const handleReportFull = () => {
    dispatch({
      type: 'DRIVER_REPORT_FULL',
      payload: { busId: bus.id },
    });
    addToast(`Reported FULL capacity for ${bus.registrationNumber}. Alerts triggered.`, 'warning');
  };

  return (
    <div
      style={{
        background: 'var(--surface2, #1e1f24)',
        border: '1px solid var(--border, #2a2b30)',
        borderRadius: 'var(--radius, 10px)',
        padding: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Live Passenger Count
        </span>
        <CrowdBadge level={crowdLevel} seats={bus.seatsAvailable} />
      </div>

      {/* Big Visual Counter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 56,
            fontWeight: 900,
            lineHeight: 1,
            color:
              bus.seatsAvailable === 0
                ? 'var(--danger)'
                : bus.seatsAvailable <= 10
                ? 'var(--warning)'
                : 'var(--text)',
          }}
        >
          {bus.currentOccupancy}
        </span>
        <span style={{ fontSize: 20, color: 'var(--muted)', fontWeight: 600 }}>
          / {bus.capacity} seats ({percent}%)
        </span>
      </div>

      {/* Occupancy Bar */}
      <div
        style={{
          height: 10,
          background: 'var(--surface)',
          borderRadius: 5,
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(percent, 100)}%`,
            background:
              percent >= 100
                ? 'var(--danger)'
                : percent >= 75
                ? 'var(--warning)'
                : 'var(--success)',
            transition: 'width 250ms ease',
          }}
        />
      </div>

      {/* Large Touch Controls (+/- buttons) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 16,
        }}
      >
        <button
          onClick={() => updateOccupancy(bus.currentOccupancy - 5)}
          disabled={bus.currentOccupancy === 0}
          style={{
            minHeight: 52,
            borderRadius: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 18,
            fontWeight: 800,
            cursor: bus.currentOccupancy === 0 ? 'not-allowed' : 'pointer',
            opacity: bus.currentOccupancy === 0 ? 0.4 : 1,
          }}
        >
          -5
        </button>

        <button
          onClick={() => updateOccupancy(bus.currentOccupancy - 1)}
          disabled={bus.currentOccupancy === 0}
          style={{
            minHeight: 52,
            borderRadius: 8,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 22,
            fontWeight: 800,
            cursor: bus.currentOccupancy === 0 ? 'not-allowed' : 'pointer',
            opacity: bus.currentOccupancy === 0 ? 0.4 : 1,
          }}
        >
          -1
        </button>

        <button
          onClick={() => updateOccupancy(bus.currentOccupancy + 1)}
          disabled={bus.currentOccupancy >= bus.capacity}
          style={{
            minHeight: 52,
            borderRadius: 8,
            background: 'var(--accent, #f4d35e)',
            border: 'none',
            color: '#171717',
            fontSize: 22,
            fontWeight: 800,
            cursor: bus.currentOccupancy >= bus.capacity ? 'not-allowed' : 'pointer',
            opacity: bus.currentOccupancy >= bus.capacity ? 0.4 : 1,
          }}
        >
          +1
        </button>

        <button
          onClick={() => updateOccupancy(bus.currentOccupancy + 5)}
          disabled={bus.currentOccupancy >= bus.capacity}
          style={{
            minHeight: 52,
            borderRadius: 8,
            background: 'var(--accent, #f4d35e)',
            border: 'none',
            color: '#171717',
            fontSize: 18,
            fontWeight: 800,
            cursor: bus.currentOccupancy >= bus.capacity ? 'not-allowed' : 'pointer',
            opacity: bus.currentOccupancy >= bus.capacity ? 0.4 : 1,
          }}
        >
          +5
        </button>
      </div>

      {/* One-Tap "Bus is Full" Emergency Override */}
      <button
        onClick={handleReportFull}
        style={{
          width: '100%',
          minHeight: 50,
          borderRadius: 8,
          background: 'rgba(224, 82, 82, 0.15)',
          border: '1px solid rgba(224, 82, 82, 0.5)',
          color: 'var(--danger)',
          fontSize: 15,
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        🚨 One-Tap: Mark Bus As FULL (0 Seats Available)
      </button>
    </div>
  );
}
