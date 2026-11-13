'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/DemoContext';
import type { Driver } from '../../types';
import DataTypeTag from '../shared/DataTypeTag';
import Modal from '../shared/Modal';
import { generateId } from '../../utils/helpers';

export default function PassengerQueue() {
  const { state, dispatch, addToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // New driver state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [assignedBusId, setAssignedBusId] = useState('');

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedBus = state.buses.find((b) => b.id === assignedBusId);

    const newDriver: Driver = {
      id: generateId(),
      name: name.trim(),
      phone: phone.trim(),
      assignedBusId: assignedBusId || undefined,
      registrationNumber: assignedBus ? assignedBus.registrationNumber : undefined,
      onDuty: false,
      dataType: 'ACTUAL',
    };

    dispatch({ type: 'ADD_DRIVER', payload: newDriver });

    if (assignedBusId) {
      dispatch({
        type: 'UPDATE_BUS',
        payload: { id: assignedBusId, driverId: newDriver.id },
      });
    }

    addToast(`Driver ${newDriver.name} added successfully`, 'success');
    setShowAddModal(false);
    setName('');
    setPhone('+91 ');
    setAssignedBusId('');
  };

  const handleToggleDuty = (driver: Driver) => {
    const updatedStatus = !driver.onDuty;
    dispatch({
      type: 'UPDATE_DRIVER',
      payload: { id: driver.id, onDuty: updatedStatus },
    });
    addToast(
      `${driver.name} is now ${updatedStatus ? 'ON DUTY' : 'OFF DUTY'}`,
      updatedStatus ? 'success' : 'info'
    );
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    const assignedBus = state.buses.find((b) => b.id === editingDriver.assignedBusId);

    dispatch({
      type: 'UPDATE_DRIVER',
      payload: {
        id: editingDriver.id,
        name: editingDriver.name,
        phone: editingDriver.phone,
        assignedBusId: editingDriver.assignedBusId || undefined,
        registrationNumber: assignedBus ? assignedBus.registrationNumber : undefined,
      },
    });

    if (editingDriver.assignedBusId) {
      dispatch({
        type: 'UPDATE_BUS',
        payload: { id: editingDriver.assignedBusId, driverId: editingDriver.id },
      });
    }

    addToast(`Driver ${editingDriver.name} updated`, 'info');
    setEditingDriver(null);
  };

  const handleDelete = (driver: Driver) => {
    if (confirm(`Remove driver account for ${driver.name}?`)) {
      dispatch({ type: 'REMOVE_DRIVER', payload: driver.id });
      addToast(`Driver account removed`, 'warning');
    }
  };

  return (
    <div>
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
            Driver & Conductor Accounts
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            Authorize personnel linked with vehicle GPS tracking and live passenger updates.
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
          }}
        >
          ➕ Add Driver / Conductor
        </button>
      </div>

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
              <th style={{ padding: '12px 14px' }}>Name</th>
              <th style={{ padding: '12px 14px' }}>Phone Contact</th>
              <th style={{ padding: '12px 14px' }}>Assigned Bus</th>
              <th style={{ padding: '12px 14px' }}>Duty State</th>
              <th style={{ padding: '12px 14px' }}>Data Provenance</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.drivers.map((driver) => {
              const bus = state.buses.find((b) => b.id === driver.assignedBusId);

              return (
                <tr
                  key={driver.id}
                  style={{ borderBottom: '1px solid var(--border, #2a2b30)' }}
                >
                  <td style={{ padding: '12px 14px', fontWeight: 700 }}>{driver.name}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{driver.phone}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {bus ? (
                      <span
                        style={{
                          fontWeight: 700,
                          color: 'var(--accent)',
                          background: 'rgba(244, 211, 94, 0.1)',
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        {bus.registrationNumber}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={() => handleToggleDuty(driver)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        border: 'none',
                        background: driver.onDuty
                          ? 'rgba(76, 175, 132, 0.2)'
                          : 'rgba(154, 155, 163, 0.2)',
                        color: driver.onDuty ? 'var(--success)' : 'var(--muted)',
                        fontWeight: 700,
                        fontSize: 11,
                        cursor: 'pointer',
                      }}
                    >
                      {driver.onDuty ? '🟢 ON DUTY' : '⚪ OFF DUTY'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <DataTypeTag type={driver.dataType} size="sm" />
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button
                        onClick={() => setEditingDriver({ ...driver })}
                        style={{
                          padding: '4px 8px',
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
                        onClick={() => handleDelete(driver)}
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
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Driver Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Driver Account">
        <form onSubmit={handleAddDriver} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              FULL NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              MOBILE PHONE NUMBER
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
              ASSIGN TO BUS
            </label>
            <select
              value={assignedBusId}
              onChange={(e) => setAssignedBusId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 6,
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            >
              <option value="">-- No Bus Assigned --</option>
              {state.buses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.registrationNumber} ({b.type})
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
              Create Account
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Driver Modal */}
      {editingDriver && (
        <Modal open={true} onClose={() => setEditingDriver(null)} title={`Edit Driver: ${editingDriver.name}`}>
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                FULL NAME
              </label>
              <input
                type="text"
                required
                value={editingDriver.name}
                onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
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
                PHONE NUMBER
              </label>
              <input
                type="text"
                required
                value={editingDriver.phone}
                onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
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
                ASSIGNED VEHICLE
              </label>
              <select
                value={editingDriver.assignedBusId || ''}
                onChange={(e) =>
                  setEditingDriver({ ...editingDriver, assignedBusId: e.target.value })
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
                <option value="">-- No Bus Assigned --</option>
                {state.buses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.registrationNumber} ({b.type})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setEditingDriver(null)}
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
                Save Driver
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
