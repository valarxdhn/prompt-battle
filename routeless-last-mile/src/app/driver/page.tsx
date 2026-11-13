'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '../../context/DemoContext';
import Navbar from '../../components/shared/Navbar';
import Toast from '../../components/shared/Toast';
import DriverPanel from '../../components/driver/DriverPanel';

export default function DriverPage() {
  const { state, dispatch } = useApp();

  // Route guard: if role is not driver, allow one-click role switch or navigate back
  if (state.role !== 'driver') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background, #101113)' }}>
        <Navbar title="Driver & Conductor Portal" role="driver" />
        <main
          style={{
            maxWidth: 520,
            margin: '80px auto',
            padding: 24,
            textAlign: 'center',
            background: 'var(--surface, #18191c)',
            border: '1px solid var(--border, #2a2b30)',
            borderRadius: 'var(--radius, 10px)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🚌</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px 0' }}>
            Switch to Driver / Conductor Role
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px 0', lineHeight: 1.5 }}>
            You are currently viewing this screen with role:{' '}
            <strong style={{ color: 'var(--accent)' }}>{state.role || 'None'}</strong>.
            Switch your active profile to start shift duties, stream live GPS telemetry, and report passenger occupancy.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => dispatch({ type: 'SET_ROLE', payload: 'driver' })}
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
              Set Role to Driver
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background, #101113)' }}>
      <Navbar title="Driver & Conductor Terminal" role="driver" />
      <Toast />

      <main style={{ padding: '20px 16px', maxWidth: 720, margin: '0 auto' }}>
        <DriverPanel />
      </main>
    </div>
  );
}
