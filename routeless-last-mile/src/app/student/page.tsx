'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '../../context/DemoContext';
import Navbar from '../../components/shared/Navbar';
import Toast from '../../components/shared/Toast';
import StudentPanel from '../../components/student/StudentPanel';
import JourneyStatus from '../../components/student/JourneyStatus';
import StrandedForm from '../../components/student/StrandedForm';

export default function StudentPage() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'search' | 'reminders' | 'alternatives'>('search');

  // Route guard: if role is not student, allow one-click role switch or navigate back
  if (state.role !== 'student') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--background, #101113)' }}>
        <Navbar title="Student Portal" role="student" />
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px 0' }}>
            Switch to Student Role
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px 0', lineHeight: 1.5 }}>
            You are currently viewing this screen with role:{' '}
            <strong style={{ color: 'var(--accent)' }}>{state.role || 'None'}</strong>.
            Switch your active profile to continue to the student commute dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => dispatch({ type: 'SET_ROLE', payload: 'student' })}
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
              Set Role to Student
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

  const activeRemindersCount = state.reminders.filter((r) => !r.triggered && !r.cancelled).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background, #101113)' }}>
      <Navbar title="Student Commute Portal" role="student" />
      <Toast />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 16px' }}>
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border, #2a2b30)',
            marginBottom: 24,
            gap: 8,
          }}
        >
          <button
            onClick={() => setActiveTab('search')}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderBottom: `2px solid ${
                activeTab === 'search' ? 'var(--accent, #f4d35e)' : 'transparent'
              }`,
              background: 'transparent',
              color: activeTab === 'search' ? 'var(--accent, #f4d35e)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🔍 Find Bus
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderBottom: `2px solid ${
                activeTab === 'reminders' ? 'var(--accent, #f4d35e)' : 'transparent'
              }`,
              background: 'transparent',
              color: activeTab === 'reminders' ? 'var(--accent, #f4d35e)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🔔 Reminders
            {activeRemindersCount > 0 && (
              <span
                style={{
                  background: 'var(--accent, #f4d35e)',
                  color: '#171717',
                  fontSize: 11,
                  padding: '1px 6px',
                  borderRadius: 10,
                  fontWeight: 800,
                }}
              >
                {activeRemindersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alternatives')}
            style={{
              padding: '12px 18px',
              border: 'none',
              borderBottom: `2px solid ${
                activeTab === 'alternatives' ? 'var(--accent, #f4d35e)' : 'transparent'
              }`,
              background: 'transparent',
              color: activeTab === 'alternatives' ? 'var(--accent, #f4d35e)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🚗 Local Alternatives
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'search' && <StudentPanel />}
        {activeTab === 'reminders' && <JourneyStatus />}
        {activeTab === 'alternatives' && (
          <div>
            <h2 style={{ fontSize: 20, margin: '0 0 4px 0' }}>Alternative Transport Directory</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 16px 0' }}>
              Vetted local options for rural last-mile connectivity when buses are congested or delayed.
            </p>
            <StrandedForm mode="page" />
          </div>
        )}
      </main>
    </div>
  );
}
