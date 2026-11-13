'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/DemoContext';
import type { OperationalStatus, Bus } from '../../types';

interface DutyControlsProps {
  bus: Bus;
}

export default function DutyControls({ bus }: DutyControlsProps) {
  const { state, dispatch, addToast } = useApp();

  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [lastSentSeconds, setLastSentSeconds] = useState<number>(0);
  const [manualStopId, setManualStopId] = useState<string>(state.stops[0]?.id || '');
  const [delayMinutes, setDelayMinutes] = useState<number>(bus.delayMinutes || 10);
  const [showDelayInput, setShowDelayInput] = useState<boolean>(bus.operationalStatus === 'delayed');

  // Watch position / interval for simulated or real GPS streaming
  useEffect(() => {
    let watchId: number | null = null;
    let timer: NodeJS.Timeout | null = null;

    if (typeof window !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setIsGpsActive(true);
          setGpsError(null);
          dispatch({
            type: 'DRIVER_UPDATE_LOCATION',
            payload: {
              busId: bus.id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
          });
          setLastSentSeconds(0);
        },
        (err) => {
          setIsGpsActive(false);
          setGpsError(err.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    } else {
      setGpsError('Geolocation API not supported in browser environment');
    }

    // Keep an interval timer running to show "X seconds ago" and keep heartbeat
    timer = setInterval(() => {
      setLastSentSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (timer) clearInterval(timer);
    };
  }, [bus.id, dispatch]);

  // Handle manual location pick from existing bus stops
  const handleManualLocationSubmit = () => {
    const stop = state.stops.find((s) => s.id === manualStopId);
    if (!stop) return;

    dispatch({
      type: 'DRIVER_UPDATE_LOCATION',
      payload: {
        busId: bus.id,
        lat: stop.lat,
        lng: stop.lng,
      },
    });
    setLastSentSeconds(0);
    addToast(`Position calibrated manually to ${stop.name}`, 'info');
  };

  // Change Operational State
  const handleStatusChange = (status: OperationalStatus) => {
    if (status === 'delayed') {
      setShowDelayInput(true);
    } else {
      setShowDelayInput(false);
      dispatch({
        type: 'DRIVER_UPDATE_STATUS',
        payload: {
          busId: bus.id,
          operationalStatus: status,
          delayMinutes: 0,
        },
      });
      addToast(`Status updated to ${status.toUpperCase()}`, 'success');
    }
  };

  const handleConfirmDelay = () => {
    dispatch({
      type: 'DRIVER_UPDATE_STATUS',
      payload: {
        busId: bus.id,
        operationalStatus: 'delayed',
        delayMinutes: Number(delayMinutes),
        note: `Reported +${delayMinutes}m delay by driver`,
      },
    });
    addToast(`Reported +${delayMinutes}m delay. Students alerted.`, 'warning');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* GPS Telemetry Bar */}
      <div
        style={{
          background: 'var(--surface2, #1e1f24)',
          border: '1px solid var(--border, #2a2b30)',
          borderRadius: 8,
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: isGpsActive ? 'var(--success)' : 'var(--warning)',
              boxShadow: `0 0 10px ${isGpsActive ? 'rgba(76, 175, 132, 0.8)' : 'rgba(244, 164, 53, 0.8)'}`,
            }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {isGpsActive ? 'GPS STREAMING LIVE' : 'GPS STANDBY / SIMULATED'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>
              {bus.currentLat
                ? `${bus.currentLat.toFixed(4)}°N, ${bus.currentLng?.toFixed(4)}°E (Updated ${lastSentSeconds}s ago)`
                : 'Waiting for coordinate ping...'}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            // Force manual ping
            if (bus.currentLat && bus.currentLng) {
              dispatch({
                type: 'DRIVER_UPDATE_LOCATION',
                payload: {
                  busId: bus.id,
                  lat: bus.currentLat + (Math.random() - 0.5) * 0.001,
                  lng: (bus.currentLng || 80.64) + (Math.random() - 0.5) * 0.001,
                },
              });
              setLastSentSeconds(0);
              addToast('GPS telemetry ping broadcasted', 'info');
            }
          }}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🔄 Send Position Ping
        </button>
      </div>

      {/* Manual Stop Override if GPS is denied or offline */}
      {(!isGpsActive || gpsError) && (
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: 'rgba(244, 164, 53, 0.08)',
            border: '1px solid rgba(244, 164, 53, 0.25)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--warning)', marginBottom: 6 }}>
            📍 Device GPS unavailable: Calibrate position by stop
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              value={manualStopId}
              onChange={(e) => setManualStopId(e.target.value)}
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 6,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                fontSize: 13,
              }}
            >
              {state.stops.map((s) => (
                <option key={s.id} value={s.id}>
                  Current location near: {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleManualLocationSubmit}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: 'var(--accent)',
                color: '#171717',
                border: 'none',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* Operational Status Selector (Large Touch Targets for Mobile) */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--muted)',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          Operational Driving State
        </label>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
          }}
        >
          {[
            { id: 'running', label: '✅ Running', desc: 'On schedule', color: 'var(--success)' },
            { id: 'delayed', label: '⚠️ Delayed', desc: 'Traffic / stoppage', color: 'var(--warning)' },
            { id: 'stopped', label: '🛑 Stopped', desc: 'Passenger halt', color: 'var(--muted)' },
            { id: 'out-of-service', label: '❌ Out of Service', desc: 'Depot / Terminated', color: 'var(--danger)' },
          ].map((item) => {
            const isSelected = bus.operationalStatus === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleStatusChange(item.id as OperationalStatus)}
                style={{
                  minHeight: 56,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: `2px solid ${isSelected ? item.color : 'var(--border, #2a2b30)'}`,
                  background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'var(--surface2, #1e1f24)',
                  color: isSelected ? item.color : 'var(--text, #f5f5f6)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 800 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{item.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delay Minutes Adjustment */}
      {showDelayInput && (
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            background: 'rgba(244, 164, 53, 0.1)',
            border: '1px solid rgba(244, 164, 53, 0.3)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)', marginBottom: 8 }}>
            ⏱️ Specify Traffic / Delay (Minutes)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={delayMinutes}
              onChange={(e) => setDelayMinutes(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: 16, fontWeight: 800, minWidth: 60, color: 'var(--warning)' }}>
              +{delayMinutes}m
            </span>
            <button
              onClick={handleConfirmDelay}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: 'var(--warning)',
                color: '#000',
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Broadcast Delay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
