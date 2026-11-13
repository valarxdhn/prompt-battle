'use client';

import React, { useState } from 'react';
import { useApp } from '../../context/DemoContext';
import type { AltTransportProvider, AltTransportType } from '../../types';
import DataTypeTag from '../shared/DataTypeTag';
import Modal from '../shared/Modal';
import { generateId } from '../../utils/helpers';

export default function DispatchAlerts() {
  const { state, dispatch, addToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AltTransportProvider | null>(null);

  // New provider state
  const [name, setName] = useState('');
  const [type, setType] = useState<AltTransportType>('auto-rickshaw');
  const [phone, setPhone] = useState('+91 ');
  const [costMin, setCostMin] = useState(40);
  const [costMax, setCostMax] = useState(80);
  const [arrivalMins, setArrivalMins] = useState(10);
  const [tagsStr, setTagsStr] = useState('Local Union, 3 Seats');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProvider: AltTransportProvider = {
      id: generateId(),
      name: name.trim(),
      type,
      phone: phone.trim(),
      availability: 'available',
      estimatedArrivalMinutes: Number(arrivalMins),
      estimatedCostMin: Number(costMin),
      estimatedCostMax: Number(costMax),
      currency: 'INR',
      tags: tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
      dataType: 'SIMULATED',
    };

    dispatch({ type: 'ADD_ALT_PROVIDER', payload: newProvider });
    addToast(`Added transport option ${newProvider.name}`, 'success');
    setShowAddModal(false);
    setName('');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;

    dispatch({
      type: 'UPDATE_ALT_PROVIDER',
      payload: {
        id: editingProvider.id,
        name: editingProvider.name,
        type: editingProvider.type,
        phone: editingProvider.phone,
        availability: editingProvider.availability,
        estimatedArrivalMinutes: Number(editingProvider.estimatedArrivalMinutes),
        estimatedCostMin: Number(editingProvider.estimatedCostMin),
        estimatedCostMax: Number(editingProvider.estimatedCostMax),
        tags: editingProvider.tags,
      },
    });

    addToast(`Updated ${editingProvider.name}`, 'info');
    setEditingProvider(null);
  };

  const handleDelete = (provider: AltTransportProvider) => {
    if (confirm(`Remove ${provider.name} from public alternatives directory?`)) {
      dispatch({ type: 'REMOVE_ALT_PROVIDER', payload: provider.id });
      addToast(`Provider removed`, 'warning');
    }
  };

  const toggleAvailability = (provider: AltTransportProvider) => {
    const nextState =
      provider.availability === 'available'
        ? 'limited'
        : provider.availability === 'limited'
        ? 'unavailable'
        : 'available';

    dispatch({
      type: 'UPDATE_ALT_PROVIDER',
      payload: { id: provider.id, availability: nextState },
    });
    addToast(`${provider.name} availability is now ${nextState.toUpperCase()}`, 'info');
  };

  return (
    <div>
      {/* Banner */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius, 10px)',
          background: 'rgba(244, 164, 53, 0.12)',
          border: '1px solid rgba(244, 164, 53, 0.35)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)' }}>
            ⚠️ Directory Notice — All transport providers here are labelled as SIMULATED / SAMPLE DATA
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            Administrators can populate actual local auto-rickshaw unions, private bus operators, and shared taxi networks.
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 6,
            background: 'var(--accent, #f4d35e)',
            color: '#171717',
            border: 'none',
            fontWeight: 700,
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ➕ Add Local Provider
        </button>
      </div>

      {/* Provider List */}
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
              <th style={{ padding: '12px 14px' }}>Provider Name</th>
              <th style={{ padding: '12px 14px' }}>Type</th>
              <th style={{ padding: '12px 14px' }}>Estimated Fare</th>
              <th style={{ padding: '12px 14px' }}>Response Time</th>
              <th style={{ padding: '12px 14px' }}>Availability</th>
              <th style={{ padding: '12px 14px' }}>Contact Phone</th>
              <th style={{ padding: '12px 14px' }}>Origin</th>
              <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.altProviders.map((provider) => (
              <tr
                key={provider.id}
                style={{ borderBottom: '1px solid var(--border, #2a2b30)' }}
              >
                <td style={{ padding: '12px 14px', fontWeight: 700 }}>{provider.name}</td>
                <td style={{ padding: '12px 14px', textTransform: 'capitalize', color: 'var(--muted)' }}>
                  {provider.type.replace('-', ' ')}
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--accent)' }}>
                  ₹{provider.estimatedCostMin} - ₹{provider.estimatedCostMax}
                </td>
                <td style={{ padding: '12px 14px' }}>~{provider.estimatedArrivalMinutes} mins</td>
                <td style={{ padding: '12px 14px' }}>
                  <button
                    onClick={() => toggleAvailability(provider)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 12,
                      border: 'none',
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: 'pointer',
                      background:
                        provider.availability === 'available'
                          ? 'rgba(76, 175, 132, 0.2)'
                          : provider.availability === 'limited'
                          ? 'rgba(244, 164, 53, 0.2)'
                          : 'rgba(224, 82, 82, 0.2)',
                      color:
                        provider.availability === 'available'
                          ? 'var(--success)'
                          : provider.availability === 'limited'
                          ? 'var(--warning)'
                          : 'var(--danger)',
                    }}
                  >
                    ● {provider.availability.toUpperCase()}
                  </button>
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--muted)' }}>{provider.phone}</td>
                <td style={{ padding: '12px 14px' }}>
                  <DataTypeTag type="SIMULATED" size="sm" />
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      onClick={() => setEditingProvider({ ...provider })}
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
                      onClick={() => handleDelete(provider)}
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Register Alternative Provider">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              OPERATOR / SERVICE NAME
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Auto Stand"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                TRANSPORT TYPE
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                <option value="auto-rickshaw">Auto-Rickshaw</option>
                <option value="taxi">Private Taxi / Cab</option>
                <option value="private-bus">Private Bus Operator</option>
                <option value="shared-cab">Shared Cab / Van</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                PHONE NUMBER
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                MIN FARE (₹)
              </label>
              <input
                type="number"
                value={costMin}
                onChange={(e) => setCostMin(Number(e.target.value))}
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
                MAX FARE (₹)
              </label>
              <input
                type="number"
                value={costMax}
                onChange={(e) => setCostMax(Number(e.target.value))}
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
                ARRIVAL (MINS)
              </label>
              <input
                type="number"
                value={arrivalMins}
                onChange={(e) => setArrivalMins(Number(e.target.value))}
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
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
              TAGS (COMMA SEPARATED)
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. Station Stand, 4 Seats"
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
              Add Provider
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {editingProvider && (
        <Modal
          open={true}
          onClose={() => setEditingProvider(null)}
          title={`Edit Provider: ${editingProvider.name}`}
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                NAME
              </label>
              <input
                type="text"
                required
                value={editingProvider.name}
                onChange={(e) =>
                  setEditingProvider({ ...editingProvider, name: e.target.value })
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  TYPE
                </label>
                <select
                  value={editingProvider.type}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, type: e.target.value as any })
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
                  <option value="auto-rickshaw">Auto-Rickshaw</option>
                  <option value="taxi">Private Taxi</option>
                  <option value="private-bus">Private Bus</option>
                  <option value="shared-cab">Shared Cab</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  PHONE NUMBER
                </label>
                <input
                  type="text"
                  required
                  value={editingProvider.phone}
                  onChange={(e) =>
                    setEditingProvider({ ...editingProvider, phone: e.target.value })
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  MIN FARE (₹)
                </label>
                <input
                  type="number"
                  value={editingProvider.estimatedCostMin}
                  onChange={(e) =>
                    setEditingProvider({
                      ...editingProvider,
                      estimatedCostMin: Number(e.target.value),
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
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  MAX FARE (₹)
                </label>
                <input
                  type="number"
                  value={editingProvider.estimatedCostMax}
                  onChange={(e) =>
                    setEditingProvider({
                      ...editingProvider,
                      estimatedCostMax: Number(e.target.value),
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
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  ARRIVAL (MINS)
                </label>
                <input
                  type="number"
                  value={editingProvider.estimatedArrivalMinutes}
                  onChange={(e) =>
                    setEditingProvider({
                      ...editingProvider,
                      estimatedArrivalMinutes: Number(e.target.value),
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
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => setEditingProvider(null)}
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
                Save Provider
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
