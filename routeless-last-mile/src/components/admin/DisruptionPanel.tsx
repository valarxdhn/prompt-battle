'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/DemoContext';
import type { Disruption, DisruptionSeverity } from '../../types';
import DataTypeTag from '../shared/DataTypeTag';

export default function DisruptionPanel() {
  const { state, dispatch, addToast } = useApp();
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('active');

  const handleAcknowledge = (id: string) => {
    dispatch({ type: 'ACKNOWLEDGE_DISRUPTION', payload: id });
    addToast('Incident acknowledged by Dispatch Desk', 'info');
  };

  const handleResolve = (id: string) => {
    dispatch({ type: 'RESOLVE_DISRUPTION', payload: id });
    addToast('Incident marked as resolved. Normal service restored.', 'success');
  };

  // Severity color mapping
  const severityColors: Record<DisruptionSeverity, { bg: string; color: string; border: string }> = {
    critical: { bg: 'rgba(224, 82, 82, 0.15)', color: 'var(--danger)', border: 'rgba(224, 82, 82, 0.4)' },
    high: { bg: 'rgba(244, 164, 53, 0.15)', color: 'var(--warning)', border: 'rgba(244, 164, 53, 0.4)' },
    medium: { bg: 'rgba(244, 211, 94, 0.15)', color: 'var(--accent)', border: 'rgba(244, 211, 94, 0.4)' },
    low: { bg: 'rgba(91, 156, 246, 0.15)', color: 'var(--info)', border: 'rgba(91, 156, 246, 0.4)' },
  };

  const iconByType = {
    breakdown: '🔧',
    congestion: '🚦',
    full: '👥',
    'no-gps': '📡',
    delay: '⏱️',
  };

  // Filter disruptions
  const filteredDisruptions = state.disruptions.filter((d) => {
    const matchesSeverity = severityFilter === 'all' || d.severity === severityFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? !d.resolved
        : d.resolved;
    return matchesSeverity && matchesStatus;
  });

  const activeCount = state.disruptions.filter((d) => !d.resolved).length;
  const criticalCount = state.disruptions.filter((d) => !d.resolved && d.severity === 'critical').length;

  return (
    <div>
      {/* Header and Summary */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, margin: '0 0 4px 0', fontWeight: 700 }}>
            Disruption Centre & Incident Control
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Triaged feeds from driver incident reports, automated GPS blackouts, and vehicle breakdowns.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: criticalCount > 0 ? 'rgba(224, 82, 82, 0.2)' : 'var(--surface2)',
              border: `1px solid ${criticalCount > 0 ? 'rgba(224, 82, 82, 0.5)' : 'var(--border)'}`,
              fontSize: 12,
              fontWeight: 700,
              color: criticalCount > 0 ? 'var(--danger)' : 'var(--muted)',
            }}
          >
            CRITICAL: {criticalCount}
          </div>
          <div
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            ACTIVE INCIDENTS: {activeCount}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          {(['active', 'resolved', 'all'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setStatusFilter(mode)}
              style={{
                padding: '6px 14px',
                background: statusFilter === mode ? 'var(--surface2)' : 'transparent',
                border: 'none',
                color: statusFilter === mode ? 'var(--accent)' : 'var(--muted)',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {mode}
            </button>
          ))}
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            fontSize: 12,
          }}
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Disruption Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredDisruptions.length === 0 ? (
          <div
            style={{
              padding: 32,
              textAlign: 'center',
              background: 'var(--surface)',
              borderRadius: 8,
              border: '1px dashed var(--border)',
              color: 'var(--muted)',
            }}
          >
            ✅ No incidents matching the selected filter.
          </div>
        ) : (
          filteredDisruptions.map((disruption) => {
            const bus = state.buses.find((b) => b.id === disruption.busId);
            const route = state.routes.find((r) => r.id === disruption.routeId);
            const sev = severityColors[disruption.severity];

            return (
              <div
                key={disruption.id}
                style={{
                  background: 'var(--surface, #18191c)',
                  border: `1px solid ${sev.border}`,
                  borderRadius: 'var(--radius, 10px)',
                  padding: 16,
                  opacity: disruption.resolved ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>
                      {iconByType[disruption.type] || '⚠️'}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: sev.bg,
                        color: sev.color,
                        textTransform: 'uppercase',
                        border: `1px solid ${sev.border}`,
                      }}
                    >
                      {disruption.severity}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>
                      {bus ? bus.registrationNumber : 'Fleet Wide'}: {disruption.description}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DataTypeTag type={disruption.dataType} size="sm" />
                    {disruption.resolved ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--success)',
                          background: 'rgba(76, 175, 132, 0.15)',
                          padding: '2px 8px',
                          borderRadius: 20,
                        }}
                      >
                        ✓ RESOLVED
                      </span>
                    ) : disruption.acknowledged ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--info)',
                          background: 'rgba(91, 156, 246, 0.15)',
                          padding: '2px 8px',
                          borderRadius: 20,
                        }}
                      >
                        👁️ ACKNOWLEDGED
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: 'var(--danger)',
                          background: 'rgba(224, 82, 82, 0.2)',
                          padding: '2px 8px',
                          borderRadius: 20,
                        }}
                      >
                        ● UNREAD
                      </span>
                    )}
                  </div>
                </div>

                {/* Route and affected stops */}
                <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    Affected Route: <strong style={{ color: 'var(--text)' }}>{route?.name || 'General Route'}</strong>
                  </div>
                  <div>
                    Reported At: <strong style={{ color: 'var(--text)' }}>{new Date(disruption.reportedAt).toLocaleTimeString()}</strong>
                  </div>
                  {disruption.lat && (
                    <div>
                      Coordinates: <strong style={{ color: 'var(--text)' }}>{disruption.lat.toFixed(4)}°N, {disruption.lng?.toFixed(4)}°E</strong>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!disruption.resolved && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 8,
                      borderTop: '1px solid var(--border)',
                      paddingTop: 8,
                      marginTop: 4,
                    }}
                  >
                    {!disruption.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(disruption.id)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: 4,
                          background: 'var(--surface2)',
                          border: '1px solid var(--border)',
                          color: 'var(--text)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => handleResolve(disruption.id)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: 4,
                        background: 'var(--success)',
                        color: '#000',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Resolve Incident
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
