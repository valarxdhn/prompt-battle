'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/DemoContext';
import { formatTime, minutesUntil } from '../../utils/helpers';
import SMSPreview from './SMSPreview';
import EmptyState from '../shared/EmptyState';

export default function JourneyStatus() {
  const { state, dispatch, addToast } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState<number>(15);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const requestPermission = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          addToast('Browser notifications enabled!', 'success');
        } else {
          addToast('Browser notifications denied or unsupported.', 'warning');
        }
      });
    }
  };

  const handleSaveEdit = (reminderId: string) => {
    dispatch({
      type: 'UPDATE_REMINDER',
      payload: {
        id: reminderId,
        minutesBefore: Number(editMinutes),
      },
    });
    setEditingId(null);
    addToast('Reminder timing updated', 'info');
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_REMINDER', payload: id });
    addToast('Reminder cancelled', 'info');
  };

  if (state.reminders.length === 0) {
    return (
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Scheduled Bus Alerts</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
              Receive automated advance alerts before your bus pulls into your stop.
            </p>
          </div>
          <button
            onClick={requestPermission}
            className="btn btn-ghost btn-sm"
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            🔔 Enable Notifications
          </button>
        </div>

        <EmptyState
          icon="⏰"
          title="No Active Reminders"
          message="Search for a bus in the Find Bus tab and tap 'Remind Me' to set up advance alerts."
        />
      </div>
    );
  }

  const activeReminders = state.reminders.filter((r) => !r.triggered && !r.cancelled);
  const pastOrCancelled = state.reminders.filter((r) => r.triggered || r.cancelled);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: 20 }}>Scheduled Bus Alerts</h2>
          <p style={{ margin: 0, color: 'var(--muted)', fontSize: 13 }}>
            Active monitoring across live GPS and driver reports.
          </p>
        </div>
        <button
          onClick={requestPermission}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: 'var(--surface2, #1e1f24)',
            border: '1px solid var(--border, #2a2b30)',
            color: 'var(--accent, #f4d35e)',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          🔔 Notification Settings
        </button>
      </div>

      {/* Active Reminders List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {activeReminders.map((rem) => {
          const bus = state.buses.find((b) => b.id === rem.busId);
          const isAffected = rem.updatedDueToDisruption || bus?.status === 'breakdown';
          const minsToArrival = minutesUntil(rem.busArrivalTime);

          return (
            <div
              key={rem.id}
              style={{
                background: isAffected
                  ? 'rgba(224, 82, 82, 0.08)'
                  : 'var(--surface, #18191c)',
                border: `1px solid ${
                  isAffected ? 'rgba(224, 82, 82, 0.4)' : 'var(--border, #2a2b30)'
                }`,
                borderRadius: 'var(--radius, 10px)',
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: 'var(--accent, #f4d35e)',
                    }}
                  >
                    {rem.busNumber}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      color: 'var(--muted)',
                      fontWeight: 500,
                    }}
                  >
                    Boarding Stop: <strong style={{ color: 'var(--text)' }}>{rem.stopName}</strong>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 20,
                      background: isAffected ? 'rgba(224, 82, 82, 0.2)' : 'rgba(76, 175, 132, 0.2)',
                      color: isAffected ? 'var(--danger)' : 'var(--success)',
                    }}
                  >
                    {isAffected ? '⚠️ STATUS CHANGED' : '● MONITORING ACTIVE'}
                  </span>
                </div>
              </div>

              {isAffected && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(224, 82, 82, 0.15)',
                    color: 'var(--danger)',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  🚨 Schedule change detected: Bus {rem.busNumber} was reported {bus?.status || 'delayed'} by {bus?.lastUpdatedBy || 'system'}.
                  Estimated arrival updated to {formatTime(rem.busArrivalTime)}.
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 12,
                  fontSize: 13,
                  padding: '10px 0',
                  borderTop: '1px solid var(--border, #2a2b30)',
                  borderBottom: '1px solid var(--border, #2a2b30)',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>SCHEDULED ARRIVAL</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {formatTime(rem.busArrivalTime)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    ({minsToArrival > 0 ? `in ${minsToArrival}m` : 'Arrived / Passed'})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>ALERT LEAD TIME</div>
                  {editingId === rem.id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <input
                        type="number"
                        min="2"
                        max="60"
                        value={editMinutes}
                        onChange={(e) => setEditMinutes(Number(e.target.value))}
                        style={{
                          width: 60,
                          padding: '3px 6px',
                          borderRadius: 4,
                          background: 'var(--surface2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      />
                      <button
                        onClick={() => handleSaveEdit(rem.id)}
                        style={{
                          padding: '3px 8px',
                          background: 'var(--accent)',
                          color: '#000',
                          border: 'none',
                          borderRadius: 4,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {rem.minutesBefore} minutes prior
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    Trigger: {formatTime(rem.reminderTime)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>CURRENT OCCUPANCY</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {bus ? `${bus.seatsAvailable} seats left` : 'Unknown'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    Status: {bus?.status || 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Actions & SMS Preview Toggle */}
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <button
                  onClick={() => setPreviewId(previewId === rem.id ? null : rem.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--info)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  📱 {previewId === rem.id ? 'Hide Simulated SMS' : 'Preview Simulated SMS'}
                </button>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setEditingId(rem.id);
                      setEditMinutes(rem.minutesBefore);
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      background: 'var(--surface2)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Edit Time
                  </button>
                  <button
                    onClick={() => handleDelete(rem.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 4,
                      background: 'rgba(224, 82, 82, 0.15)',
                      border: '1px solid rgba(224, 82, 82, 0.3)',
                      color: 'var(--danger)',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel Alert
                  </button>
                </div>
              </div>

              {/* Collapsible SMS simulation */}
              {previewId === rem.id && (
                <div style={{ marginTop: 14 }}>
                  <SMSPreview reminder={rem} disruptionNote={bus?.note} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Past or Triggered History */}
      {pastOrCancelled.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 12 }}>
            Past / Triggered Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pastOrCancelled.map((rem) => (
              <div
                key={rem.id}
                style={{
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: 'var(--surface2, #1e1f24)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  color: 'var(--muted)',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--text)' }}>{rem.busNumber}</strong> at {rem.stopName}
                </div>
                <div>
                  {rem.cancelled ? '❌ Cancelled' : '✅ Alert Sent at ' + formatTime(rem.reminderTime)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
