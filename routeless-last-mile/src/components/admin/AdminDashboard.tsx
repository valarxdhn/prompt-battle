'use client';

import React from 'react';
import { useApp } from '../../context/DemoContext';
import StatCards, { StatItem } from './StatCards';
import StatusBadge from '../shared/StatusBadge';
import DataTypeTag from '../shared/DataTypeTag';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export default function AdminDashboard({ onNavigateTab }: AdminDashboardProps) {
  const { state, dispatch, addToast } = useApp();

  const totalBuses = state.buses.length;
  const operationalBuses = state.buses.filter(
    (b) => b.operationalStatus === 'running' || b.operationalStatus === 'delayed'
  ).length;
  const activeDisruptions = state.disruptions.filter((d) => !d.resolved).length;
  const driversOnDuty = state.drivers.filter((d) => d.onDuty).length;
  const fullBuses = state.buses.filter((b) => b.seatsAvailable === 0).length;

  const stats: StatItem[] = [
    {
      label: 'Total Fleet',
      value: totalBuses,
      icon: '🚌',
      subtext: `${operationalBuses} currently active on routes`,
    },
    {
      label: 'Operational',
      value: `${Math.round((operationalBuses / (totalBuses || 1)) * 100)}%`,
      icon: '⚡',
      color: 'var(--success)',
      subtext: `${totalBuses - operationalBuses} down / out-of-service`,
    },
    {
      label: 'Disruptions',
      value: activeDisruptions,
      icon: '🚨',
      color: activeDisruptions > 0 ? 'var(--danger)' : 'var(--success)',
      subtext: 'Requires dispatcher clearance',
    },
    {
      label: 'Drivers On Duty',
      value: driversOnDuty,
      icon: '👥',
      color: 'var(--accent)',
      subtext: 'Reporting GPS telemetry',
    },
    {
      label: 'Full / Congested',
      value: fullBuses,
      icon: '⚠️',
      color: fullBuses > 0 ? 'var(--warning)' : 'var(--text)',
      subtext: 'Triggers auto-alternatives',
    },
  ];

  const handleResolveAllLow = () => {
    const lowDisruptions = state.disruptions.filter(
      (d) => !d.resolved && (d.severity === 'low' || d.severity === 'medium')
    );
    lowDisruptions.forEach((d) => {
      dispatch({ type: 'RESOLVE_DISRUPTION', payload: d.id });
    });
    addToast(`Resolved ${lowDisruptions.length} low/medium incidents`, 'info');
  };

  return (
    <div>
      {/* Top Stat Row */}
      <StatCards stats={stats} />

      {/* Grid: Live Fleet Overview & Critical Incidents */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Active Disruptions Panel */}
        <div
          style={{
            background: 'var(--surface, #18191c)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Active Incident Queue ({activeDisruptions})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('disruptions')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View All →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {state.disruptions.filter((d) => !d.resolved).length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                ✅ All systems running smoothly. No active route disruptions reported.
              </div>
            ) : (
              state.disruptions
                .filter((d) => !d.resolved)
                .slice(0, 3)
                .map((d) => {
                  const bus = state.buses.find((b) => b.id === d.busId);
                  return (
                    <div
                      key={d.id}
                      style={{
                        padding: 10,
                        borderRadius: 6,
                        background: 'var(--surface2, #1e1f24)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                          {bus?.registrationNumber || 'Fleet'}: {d.description}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                          Severity: <strong style={{ color: 'var(--danger)' }}>{d.severity.toUpperCase()}</strong> ·{' '}
                          {new Date(d.reportedAt).toLocaleTimeString()}
                        </div>
                      </div>

                      {!d.acknowledged && (
                        <button
                          onClick={() => {
                            dispatch({ type: 'ACKNOWLEDGE_DISRUPTION', payload: d.id });
                            addToast('Incident acknowledged', 'info');
                          }}
                          style={{
                            padding: '3px 8px',
                            background: 'var(--accent)',
                            color: '#000',
                            border: 'none',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Ack
                        </button>
                      )}
                    </div>
                  );
                })
            )}
          </div>

          {activeDisruptions > 0 && (
            <div style={{ marginTop: 12, textAlign: 'right' }}>
              <button
                onClick={handleResolveAllLow}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  fontSize: 11,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Resolve minor congestion alerts
              </button>
            </div>
          )}
        </div>

        {/* Real-time Fleet Status Matrix */}
        <div
          style={{
            background: 'var(--surface, #18191c)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 18 }}>🚌</span>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                Live Vehicle Stream
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('fleet')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Manage Fleet →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.buses.slice(0, 4).map((b) => (
              <div
                key={b.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'var(--surface2, #1e1f24)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 12,
                }}
              >
                <div>
                  <span style={{ fontWeight: 800, color: 'var(--accent)' }}>
                    {b.registrationNumber}
                  </span>{' '}
                  <span style={{ color: 'var(--muted)' }}>
                    ({b.seatsAvailable}/{b.capacity} seats)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <StatusBadge status={b.status} />
                  <DataTypeTag type={b.dataType} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div
        style={{
          background: 'var(--surface, #18191c)',
          border: '1px solid var(--border, #2a2b30)',
          borderRadius: 'var(--radius, 10px)',
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Dispatcher Operations:</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>
            Configure fleet schedules, emergency alternatives directory, and conductor assignments.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onNavigateTab('fleet')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🚌 Fleet Registry
          </button>
          <button
            onClick={() => onNavigateTab('drivers')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            👥 Driver Accounts
          </button>
          <button
            onClick={() => onNavigateTab('alternatives')}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            🚗 Transport Directory
          </button>
        </div>
      </div>
    </div>
  );
}
