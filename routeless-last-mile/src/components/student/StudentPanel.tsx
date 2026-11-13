'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/DemoContext';
import type { BusSearchResult, Reminder } from '../../types';
import { searchBuses } from '../../lib/dispatch/dispatchEngine';
import RecommendationCard from './RecommendationCard';
import StrandedForm from './StrandedForm';
import EmptyState from '../shared/EmptyState';
import LoadingState from '../shared/LoadingState';
import { generateId, getReminderTime } from '../../utils/helpers';

export default function StudentPanel() {
  const { state, dispatch, addToast } = useApp();

  // Search parameters
  const [originStopId, setOriginStopId] = useState<string>(state.stops[0]?.id || 'stop-1');
  const [destinationStopId, setDestinationStopId] = useState<string>(
    state.stops[state.stops.length - 1]?.id || 'stop-3'
  );
  const [preferredTime, setPreferredTime] = useState<string>('07:30');
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(true);
  const [showManualStopPicker, setShowManualStopPicker] = useState<boolean>(false);

  // Perform search using dispatchEngine
  const searchResult = useMemo(() => {
    return searchBuses(state, {
      originStopId,
      destinationStopId,
      preferredDepartureTime: preferredTime,
    });
  }, [state, originStopId, destinationStopId, preferredTime]);

  // Geolocation handler
  const handleUseLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      addToast('Geolocation is not supported by your browser', 'warning');
      setShowManualStopPicker(true);
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const { latitude, longitude } = position.coords;

        // Find nearest stop by simple Euclidean distance
        let nearestStop = state.stops[0];
        let minDist = Infinity;

        for (const stop of state.stops) {
          const d = Math.hypot(stop.lat - latitude, stop.lng - longitude);
          if (d < minDist) {
            minDist = d;
            nearestStop = stop;
          }
        }

        if (nearestStop) {
          setOriginStopId(nearestStop.id);
          addToast(
            `GPS pinpointed: Nearest stop is ${nearestStop.name}`,
            'success'
          );
        }
      },
      (error) => {
        setGpsLoading(false);
        addToast(
          `GPS permission ${error.message.toLowerCase()}. Please select stop manually.`,
          'info'
        );
        setShowManualStopPicker(true);
      },
      { timeout: 7000 }
    );
  };

  // Add Advance Reminder
  const handleSetReminder = (result: BusSearchResult, minutesBefore: number) => {
    const reminderTime = getReminderTime(result.etaAtStop, minutesBefore);

    const newReminder: Reminder = {
      id: generateId(),
      busId: result.bus.id,
      scheduleId: result.schedule.id,
      stopId: result.boardingStop.id,
      busNumber: result.bus.registrationNumber,
      stopName: result.boardingStop.name,
      busArrivalTime: result.etaAtStop,
      minutesBefore,
      reminderTime,
      triggered: false,
      cancelled: false,
      updatedDueToDisruption: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_REMINDER', payload: newReminder });
    addToast(
      `Reminder set! We'll alert you ${minutesBefore} mins before ${result.bus.registrationNumber} arrives at ${result.boardingStop.name}.`,
      'success'
    );
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setHasSearched(true);
    }, 300);
  };

  return (
    <div>
      {/* Search Header Banner */}
      <div
        style={{
          background: 'var(--surface, #18191c)',
          border: '1px solid var(--border, #2a2b30)',
          borderRadius: 'var(--radius, 10px)',
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800 }}>
            Plan Your Route & Commute
          </h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
            Live status synchronized with on-duty drivers and dispatch monitoring.
          </p>
        </div>

        <form onSubmit={handleManualSearch}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 16,
              alignItems: 'flex-end',
            }}
          >
            {/* Origin Stop with GPS Fallback */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}
              >
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)' }}>
                  BOARDING FROM
                </label>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={gpsLoading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent, #f4d35e)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: 0,
                  }}
                >
                  📍 {gpsLoading ? 'Locating...' : 'Use My GPS'}
                </button>
              </div>

              <select
                value={originStopId}
                onChange={(e) => setOriginStopId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--surface2, #1e1f24)',
                  border: '1px solid var(--border, #2a2b30)',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {state.stops.map((stop) => (
                  <option key={stop.id} value={stop.id}>
                    {stop.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Stop */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--muted)',
                  marginBottom: 6,
                }}
              >
                DESTINATION
              </label>
              <select
                value={destinationStopId}
                onChange={(e) => setDestinationStopId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--surface2, #1e1f24)',
                  border: '1px solid var(--border, #2a2b30)',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {state.stops.map((stop) => (
                  <option
                    key={stop.id}
                    value={stop.id}
                    disabled={stop.id === originStopId}
                  >
                    {stop.name} {stop.id === originStopId ? '(Current Stop)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Time */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--muted)',
                  marginBottom: 6,
                }}
              >
                PREFERRED TIME
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--surface2, #1e1f24)',
                  border: '1px solid var(--border, #2a2b30)',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontWeight: 600,
                }}
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--accent, #f4d35e)',
                  color: '#171717',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                🔍 Search Schedule
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results View */}
      {isSearching ? (
        <LoadingState message="Connecting to fleet dispatch & matching routes..." />
      ) : (
        <div>
          {/* Automatic Alternative Trigger Notification */}
          {searchResult.showAlternatives && (
            <div
              style={{
                background: 'rgba(244, 164, 53, 0.12)',
                border: '1px solid rgba(244, 164, 53, 0.4)',
                borderRadius: 'var(--radius, 10px)',
                padding: '16px 20px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>⚠️</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--warning)' }}>
                  No Suitable Regular Bus at This Time
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                All scheduled buses for this route are either fully packed, significantly delayed, or out of service.
                Review the vetted alternative transport providers below to reach your destination on time.
              </p>
            </div>
          )}

          {/* Active Available Buses */}
          {searchResult.results.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 14,
                }}
              >
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  Recommended Buses ({searchResult.results.length})
                </h3>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  Ranked by time proximity & available seats
                </span>
              </div>

              {searchResult.results.map((item) => (
                <RecommendationCard
                  key={item.bus.id + item.schedule.id}
                  result={item}
                  onSetReminder={handleSetReminder}
                />
              ))}
            </div>
          )}

          {/* Unavailable / Breakdown Buses section */}
          {searchResult.unavailable.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <h4
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--danger)',
                  marginBottom: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>🚫</span> Disrupted / Unavailable Buses ({searchResult.unavailable.length})
              </h4>
              {searchResult.unavailable.map((item) => (
                <RecommendationCard
                  key={item.bus.id + item.schedule.id}
                  result={item}
                  onSetReminder={handleSetReminder}
                  isUnavailable={true}
                />
              ))}
            </div>
          )}

          {/* If completely empty */}
          {!searchResult.hasResults && (
            <EmptyState
              icon="🚌"
              title="No Buses Found on This Route"
              message={`No direct scheduled bus runs between the selected stops at ${preferredTime}.`}
            />
          )}

          {/* Inline or Fallback Alternatives Directory */}
          {(searchResult.showAlternatives || !searchResult.hasResults) && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, color: 'var(--accent)' }}>
                🚗 Local Alternative Transport Options
              </h3>
              <StrandedForm mode="inline" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
