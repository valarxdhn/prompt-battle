'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/DemoContext';
import type { Bus, BusStatus, OperationalStatus } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import DataTypeTag from '../shared/DataTypeTag';
import Modal from '../shared/Modal';
import { generateId } from '../../utils/helpers';

export default function FleetOverview() {
  const { state, dispatch, addToast } = useApp();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBus, setEditingBus] = useState<Bus | null>(null);

  // New bus form state
  const [newReg, setNewReg] = useState('');
  const [newCapacity, setNewCapacity] = useState(50);
  const [newType, setNewType] = useState<'mini' | 'standard' | 'articulated'>('standard');
  const [assignedDriverId, setAssignedDriverId] = useState('');

  // Handle bus registration
  const handleAddBus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReg.trim()) return;

    const newBus: Bus = {
      id: generateId(),
      registrationNumber: newReg.trim().toUpperCase(),
      capacity: Number(newCapacity),
      type: newType,
      driverId: assignedDriverId || undefined,
      status: 'on-time',
      operationalStatus: 'running',
      currentOccupancy: 0,
      seatsAvailable: Number(newCapacity),
      currentLat: 16.5062,
      currentLng: 80.648,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'admin',
      delayMinutes: 0,
      dataType: 'ACTUAL',
    };

    dispatch({ type: 'ADD_BUS', payload: newBus });

    if (assignedDriverId) {
      dispatch({
        type: 'UPDATE_DRIVER',
        payload: {
          id: assignedDriverId,
          assignedBusId: newBus.id,
          registrationNumber: newBus.registrationNumber,
        },
      });
    }

    addToast(`Registered new bus ${newBus.registrationNumber}`, 'success');
    setShowAddModal(false);
    setNewReg('');
    setAssignedDriverId('');
  };

  // Handle edit save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBus) return;

    dispatch({
      type: 'UPDATE_BUS',
      payload: {
        id: editingBus.id,
        capacity: Number(editingBus.capacity),
        type: editingBus.type,
        status: editingBus.status,
        operationalStatus: editingBus.operationalStatus,
        delayMinutes: Number(editingBus.delayMinutes || 0),
        note: editingBus.note,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: 'admin',
      },
    });

    addToast(`Bus ${editingBus.registrationNumber} updated`, 'info');
    setEditingBus(null);
  };

  // Handle remove bus
  const handleRemove = (bus: Bus) => {
    if (confirm(`Are you sure you want to remove bus ${bus.registrationNumber}?`)) {
      dispatch({ type: 'REMOVE_BUS', payload: bus.id });
      addToast(`Bus ${bus.registrationNumber} decommissioned`, 'warning');
    }
  };

  // Filtered buses
  const filteredBuses = state.buses.filter((b) => {
    const matchesQuery = b.registrationNumber.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div>
      {/* Top Header & Actions */}
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
            Fleet Monitor & Vehicle Registry
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Live status, GPS telemetry, passenger occupancy, and operational assignments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm, 6px)',
            background: 'var(--accent, #f4d35e)',
            color: '#171717',
            border: 'none',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ➕ Register New Bus
        </button>
      </div>

      {/* Visual Live Grid Map / Fleet Placement */}
      <div
        style={{
          background: 'var(--surface, #18191c)',
          border: '1px solid var(--border, #2a2b30)',
          borderRadius: 'var(--radius, 10px)',
          padding: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            📍 Live Visual Fleet Spatial Matrix
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            Real-time coordinates streamed from driver GPS telemetry
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
          }}
        >
          {state.buses.map((bus) => {
            const isDown = bus.status === 'breakdown' || bus.status === 'unavailable';
            const isFull = bus.seatsAvailable === 0;

            return (
              <div
                key={bus.id}
                style={{
                  background: 'var(--surface2, #1e1f24)',
                  border: `1px solid ${
                    isDown
                      ? 'rgba(224, 82, 82, 0.4)'
                      : isFull
                      ? 'rgba(244, 164, 53, 0.4)'
                      : 'var(--border, #2a2b30)'
                  }`,
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: isDown
                      ? 'var(--danger)'
                      : isFull
                      ? 'var(--warning)'
                      : 'var(--success)',
                    boxShadow: `0 0 10px ${
                      isDown
                        ? 'rgba(224, 82, 82, 0.6)'
                        : isFull
                        ? 'rgba(244, 164, 53, 0.6)'
                        : 'rgba(76, 175, 132, 0.6)'
                    }`,
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--accent)' }}>
                    {bus.registrationNumber}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                    {bus.currentLat ? `${bus.currentLat.toFixed(3)}°N, ${bus.currentLng?.toFixed(3)}°E` : 'No GPS Fix'}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text)', marginTop: 2 }}>
                    Seats: {bus.seatsAvailable}/{bus.capacity} · {bus.status.toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Filter by Registration (e.g. BUS-101)..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          style={{
            flex: '1 1 200px',
            padding: '8px 12px',
            borderRadius: 6,
            background: 'var(--surface, #18191c)',
            border: '1px solid var(--border, #2a2b30)',
            color: 'var(--text)',
            fontSize: 13,
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            background: 'var(--surface, #18191c)',
            border: '1px solid var(--border, #2a2b30)',
            color: 'var(--text)',
            fontSize: 13,
          }}
        >
          <option value="all">All Statuses</option>
          <option value="on-time">On Time</option>
          <option value="delayed">Delayed</option>
          <option value="full">Full</option>
          <option value="unavailable">Unavailable</option>
          <option value="breakdown">Breakdown</option>
        </select>
      </div>

      {/* Fleet Table */}
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
              <th style={{ padding: '12px 14px' }}>Reg #</th>
              <th style={{ padding: '12px 14px' }}>Type</th>
              <th style={{ padding: '12px 14px' }}>Assigned Driver</th>
              <th style={{ padding: '12px 14px' }}>Occupancy</th>
              <th style={{ padding: '12px 14px' }}>Status</th>
              <th style={{ padding: '12px 14px' }}>Last Update</th>
              <th style={{ padding: '12px 14px' }}>Data Provenance</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.map((bus) => {
              const driver = state.drivers.find((d) => d.id === bus.driverId);
              const occPercent = Math.round((bus.currentOccupancy / bus.capacity) * 100);

              return (
                <tr
                  key={bus.id}
                  style={{
                    borderBottom: '1px solid var(--border, #2a2b30)',
                    background:
                      bus.status === 'breakdown'
                        ? 'rgba(224, 82, 82, 0.05)'
                        : 'transparent',
                  }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 800, color: 'var(--accent)' }}>
                    {bus.registrationNumber}
                  </td>
                  <td style={{ padding: '12px 14px', textTransform: 'capitalize', color: 'var(--muted)' }}>
                    {bus.type} ({bus.capacity} seats)
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {driver ? (
                      <span style={{ fontWeight: 600 }}>
                        {driver.name} {driver.onDuty ? '🟢' : '⚪'}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          flex: 1,
                          height: 6,
                          background: 'var(--border)',
                          borderRadius: 3,
                          overflow: 'hidden',
                          minWidth: 60,
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(occPercent, 100)}%`,
                            background:
                              occPercent >= 95
                                ? 'var(--danger)'
                                : occPercent >= 75
                                ? 'var(--warning)'
                                : 'var(--success)',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, minWidth: 45 }}>
                        {bus.seatsAvailable} left
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <StatusBadge status={bus.status} />
                    {bus.delayMinutes > 0 && (
                      <span style={{ fontSize: 11, color: 'var(--warning)', marginLeft: 6 }}>
                        +{bus.delayMinutes}m
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--muted)' }}>
                    {new Date(bus.lastUpdated).toLocaleTimeString()} by{' '}
                    <strong style={{ color: 'var(--text)' }}>{bus.lastUpdatedBy}</strong>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <DataTypeTag type={bus.dataType} size="sm" />
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => setEditingBus({ ...bus })}
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
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(bus)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 4,
                          background: 'rgba(224, 82, 82, 0.15)',
                          border: '1px solid rgba(224, 82, 82, 0.3)',
                          color: 'var(--danger)',
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Register Bus Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Register New Vehicle">
        <form onSubmit={handleAddBus} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              REGISTRATION NUMBER
            </label>
            <input
              type="text"
              placeholder="e.g. BUS-305"
              required
              value={newReg}
              onChange={(e) => setNewReg(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                PASSENGER CAPACITY
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={newCapacity}
                onChange={(e) => setNewCapacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                VEHICLE TYPE
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                <option value="mini">Mini Bus (20-35)</option>
                <option value="standard">Standard Fleet (50-60)</option>
                <option value="articulated">Articulated / Express (80+)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              ASSIGN DRIVER / CONDUCTOR (OPTIONAL)
            </label>
            <select
              value={assignedDriverId}
              onChange={(e) => setAssignedDriverId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              <option value="">-- No Driver Assigned --</option>
              {state.drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              style={{
                padding: '8px 14px',
                borderRadius: 6,
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                borderRadius: 6,
                background: 'var(--accent)',
                color: '#171717',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Confirm Registration
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Bus Modal */}
      {editingBus && (
        <Modal open={true} onClose={() => setEditingBus(null)} title={`Edit Bus ${editingBus.registrationNumber}`}>
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  CAPACITY
                </label>
                <input
                  type="number"
                  value={editingBus.capacity}
                  onChange={(e) =>
                    setEditingBus({ ...editingBus, capacity: Number(e.target.value) })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  TYPE
                </label>
                <select
                  value={editingBus.type}
                  onChange={(e) =>
                    setEditingBus({ ...editingBus, type: e.target.value as any })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="mini">Mini Bus</option>
                  <option value="standard">Standard</option>
                  <option value="articulated">Articulated</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  OVERALL STATUS
                </label>
                <select
                  value={editingBus.status}
                  onChange={(e) =>
                    setEditingBus({ ...editingBus, status: e.target.value as BusStatus })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="on-time">On Time</option>
                  <option value="delayed">Delayed</option>
                  <option value="full">Full</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="breakdown">Breakdown</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  OPERATIONAL STATE
                </label>
                <select
                  value={editingBus.operationalStatus}
                  onChange={(e) =>
                    setEditingBus({
                      ...editingBus,
                      operationalStatus: e.target.value as OperationalStatus,
                    })
                  }
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <option value="running">Running</option>
                  <option value="delayed">Delayed</option>
                  <option value="stopped">Stopped</option>
                  <option value="out-of-service">Out of Service</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                DELAY (MINUTES)
              </label>
              <input
                type="number"
                min="0"
                value={editingBus.delayMinutes || 0}
                onChange={(e) =>
                  setEditingBus({ ...editingBus, delayMinutes: Number(e.target.value) })
                }
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                DISPATCH NOTE
              </label>
              <textarea
                value={editingBus.note || ''}
                onChange={(e) => setEditingBus({ ...editingBus, note: e.target.value })}
                rows={2}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setEditingBus(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  background: 'var(--accent)',
                  color: '#171717',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
