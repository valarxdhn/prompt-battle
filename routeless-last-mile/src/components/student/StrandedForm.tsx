'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/DemoContext';
import type { AltTransportProvider, AltTransportType } from '../../types';
import DataTypeTag from '../shared/DataTypeTag';

interface StrandedFormProps {
  mode?: 'page' | 'inline';
}

export default function StrandedForm({ mode = 'page' }: StrandedFormProps) {
  const { state, addToast } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cost' | 'arrival' | 'rating'>('cost');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Filter and sort alternative providers
  const filteredProviders = useMemo(() => {
    let list = [...state.altProviders];

    if (selectedType !== 'all') {
      list = list.filter((p) => p.type === selectedType);
    }

    list.sort((a, b) => {
      if (sortBy === 'cost') {
        return a.estimatedCostMin - b.estimatedCostMin;
      }
      if (sortBy === 'arrival') {
        return a.estimatedArrivalMinutes - b.estimatedArrivalMinutes;
      }
      return 0;
    });

    return list;
  }, [state.altProviders, selectedType, sortBy]);

  // Compute best value / cheapest / fastest tags
  const minCost = Math.min(...state.altProviders.map((p) => p.estimatedCostMin));
  const minArrival = Math.min(...state.altProviders.map((p) => p.estimatedArrivalMinutes));

  const handleContact = (provider: AltTransportProvider) => {
    addToast(
      `📞 Calling ${provider.name} at ${provider.phone} (Simulated)`,
      'info'
    );
  };

  return (
    <div style={{ marginTop: mode === 'inline' ? 16 : 0 }}>
      {/* Prominent Simulated Data Warning Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius, 10px)',
          background: 'rgba(244, 164, 53, 0.12)',
          border: '1px solid rgba(244, 164, 53, 0.35)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>⚠️</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning, #f4a435)' }}>
            LOCAL ALTERNATIVE TRANSPORT DIRECTORY — SAMPLE / SIMULATED DATA
          </div>
          <div style={{ fontSize: 12, color: 'var(--text)', marginTop: 2, lineHeight: 1.4 }}>
            Fares, response windows, and driver contacts listed below are seeded demo models.
            Administrators can manage or verify providers in real time from the Admin Portal.
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 16,
          background: 'var(--surface, #18191c)',
          padding: 12,
          borderRadius: 8,
          border: '1px solid var(--border, #2a2b30)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Filter:</span>
          {['all', 'auto-rickshaw', 'taxi', 'private-bus', 'shared-cab'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: selectedType === type ? 'var(--accent)' : 'var(--border)',
                background: selectedType === type ? 'rgba(244, 211, 94, 0.2)' : 'transparent',
                color: selectedType === type ? 'var(--accent)' : 'var(--muted)',
                textTransform: 'capitalize',
              }}
            >
              {type.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontSize: 12,
            }}
          >
            <option value="cost">Lowest Cost</option>
            <option value="arrival">Earliest Arrival</option>
          </select>

          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 4 }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '4px 8px',
                background: viewMode === 'cards' ? 'var(--surface2)' : 'transparent',
                border: 'none',
                color: viewMode === 'cards' ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '4px 8px',
                background: viewMode === 'table' ? 'var(--surface2)' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? 'var(--accent)' : 'var(--muted)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 16,
          }}
        >
          {filteredProviders.map((provider) => {
            const isCheapest = provider.estimatedCostMin === minCost;
            const isFastest = provider.estimatedArrivalMinutes === minArrival;

            return (
              <div
                key={provider.id}
                style={{
                  background: 'var(--surface, #18191c)',
                  border: '1px solid var(--border, #2a2b30)',
                  borderRadius: 'var(--radius, 10px)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        color: 'var(--muted)',
                        fontWeight: 700,
                      }}
                    >
                      {provider.type.replace('-', ' ')}
                    </span>
                    <DataTypeTag type="SIMULATED" size="sm" />
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: 16, fontWeight: 700 }}>
                    {provider.name}
                  </h3>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {isCheapest && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'rgba(76, 175, 132, 0.2)',
                          color: 'var(--success)',
                        }}
                      >
                        🏷️ CHEAPEST
                      </span>
                    )}
                    {isFastest && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'rgba(91, 156, 246, 0.2)',
                          color: 'var(--info)',
                        }}
                      >
                        ⚡ FASTEST
                      </span>
                    )}
                    {provider.tags?.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: 10,
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: 'var(--surface2)',
                          color: 'var(--muted)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      background: 'var(--surface2, #1e1f24)',
                      padding: 10,
                      borderRadius: 6,
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 8,
                      fontSize: 12,
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div style={{ color: 'var(--muted)', fontSize: 10 }}>EST. ARRIVAL</div>
                      <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>
                        ~{provider.estimatedArrivalMinutes} mins
                      </div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--muted)', fontSize: 10 }}>FARE ESTIMATE</div>
                      <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 14 }}>
                        ₹{provider.estimatedCostMin} - ₹{provider.estimatedCostMax}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 8,
                    paddingTop: 10,
                    borderTop: '1px solid var(--border, #2a2b30)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color:
                        provider.availability === 'available'
                          ? 'var(--success)'
                          : 'var(--warning)',
                    }}
                  >
                    ● {provider.availability.toUpperCase()}
                  </span>

                  <button
                    onClick={() => handleContact(provider)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-sm, 6px)',
                      background: 'var(--accent, #f4d35e)',
                      color: '#171717',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    📞 Call / Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div
          style={{
            overflowX: 'auto',
            background: 'var(--surface, #18191c)',
            borderRadius: 'var(--radius, 10px)',
            border: '1px solid var(--border, #2a2b30)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface2)',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: '10px 14px' }}>Provider</th>
                <th style={{ padding: '10px 14px' }}>Type</th>
                <th style={{ padding: '10px 14px' }}>Est. Arrival</th>
                <th style={{ padding: '10px 14px' }}>Estimated Fare</th>
                <th style={{ padding: '10px 14px' }}>Availability</th>
                <th style={{ padding: '10px 14px' }}>Origin Tag</th>
                <th style={{ padding: '10px 14px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProviders.map((provider) => (
                <tr
                  key={provider.id}
                  style={{ borderBottom: '1px solid var(--border, #2a2b30)' }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{provider.name}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)', textTransform: 'capitalize' }}>
                    {provider.type.replace('-', ' ')}
                  </td>
                  <td style={{ padding: '12px 14px' }}>~{provider.estimatedArrivalMinutes}m</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--accent)' }}>
                    ₹{provider.estimatedCostMin} - ₹{provider.estimatedCostMax}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        color:
                          provider.availability === 'available'
                            ? 'var(--success)'
                            : 'var(--warning)',
                        fontWeight: 600,
                      }}
                    >
                      {provider.availability}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <DataTypeTag type="SIMULATED" size="sm" />
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => handleContact(provider)}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--accent)',
                        color: '#000',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Call
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
