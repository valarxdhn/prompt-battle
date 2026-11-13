'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/DemoContext';
import Navbar from '../../components/shared/Navbar';
import Toast from '../../components/shared/Toast';
import AdminDashboard from '../../components/admin/AdminDashboard';
import FleetOverview from '../../components/admin/FleetOverview';
import PassengerQueue from '../../components/admin/PassengerQueue';
import DisruptionPanel from '../../components/admin/DisruptionPanel';
import DispatchAlerts from '../../components/admin/DispatchAlerts';

export default function AdminPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Route guard: if role is not admin, allow one-click role switch or navigate back
  if (state.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background, #101113)' }}>
        <Navbar title="Admin Operations Desk" role="admin" />
        <main
          style={{
            maxWidth: 600,
            margin: '80px auto',
            padding: 24,
            textAlign: 'center',
            background: 'var(--surface, #18191c)',
            border: '1px solid var(--border, #2a2b30)',
            borderRadius: 'var(--radius, 10px)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px 0' }}>
            Switch to Admin Role
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px 0', lineHeight: 1.5 }}>
            You are currently viewing this screen with role:{' '}
            <strong style={{ color: 'var(--accent)' }}>{state.role || 'None'}</strong>.
            Switch your active profile to manage fleet operations, emergency disruptions, and driver accounts.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => dispatch({ type: 'SET_ROLE', payload: 'admin' })}
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm, 6px)',
                background: 'var(--accent, #f4d35e)',
                color: '#171717',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Set Role to Admin
            </button>
            <Link
              href="/"
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-sm, 6px)',
                background: 'var(--surface2, #1e1f24)',
                border: '1px solid var(--border, #2a2b30)',
                color: 'var(--text)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
              }}
            >
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const activeDisruptions = state.disruptions.filter((d) => !d.resolved).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background, #101113)' }}>
      <Navbar title="Dispatch & Administration Centre" role="admin" />
      <Toast />

      <main style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 16px' }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border, #2a2b30)',
            marginBottom: 24,
            overflowX: 'auto',
            gap: 6,
          }}
        >
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'fleet', label: '🚌 Fleet & Vehicles' },
            { id: 'drivers', label: '👥 Driver Accounts' },
            {
              id: 'disruptions',
              label: '🚨 Disruption Centre',
              count: activeDisruptions,
              countColor: 'var(--danger)',
            },
            { id: 'alternatives', label: '🚗 Transport Directory' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 16px',
                border: 'none',
                borderBottom: `2px solid ${
                  activeTab === tab.id ? 'var(--accent, #f4d35e)' : 'transparent'
                }`,
                background: 'transparent',
                color: activeTab === tab.id ? 'var(--accent, #f4d35e)' : 'var(--muted)',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  style={{
                    background: tab.countColor || 'var(--accent)',
                    color: '#fff',
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontWeight: 800,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <AdminDashboard onNavigateTab={setActiveTab} />}
        {activeTab === 'fleet' && <FleetOverview />}
        {activeTab === 'drivers' && <PassengerQueue />}
        {activeTab === 'disruptions' && <DisruptionPanel />}
        {activeTab === 'alternatives' && <DispatchAlerts />}
      </main>
    </div>
  );
}
