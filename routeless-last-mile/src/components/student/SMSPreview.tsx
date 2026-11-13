'use client';

import React from 'react';
import type { Reminder } from '../../types';
import { formatTime } from '../../utils/helpers';

interface SMSPreviewProps {
  reminder: Reminder;
  disruptionNote?: string;
}

export default function SMSPreview({ reminder, disruptionNote }: SMSPreviewProps) {
  const isDelayedOrCancelled = reminder.updatedDueToDisruption || reminder.cancelled;

  return (
    <div
      style={{
        background: '#1a1b1f',
        border: '1px solid #2d2f36',
        borderRadius: 12,
        padding: 14,
        fontFamily: 'monospace, sans-serif',
        maxWidth: 380,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
          borderBottom: '1px solid #2d2f36',
          paddingBottom: 6,
        }}
      >
        <span style={{ fontSize: 11, color: '#f4d35e', fontWeight: 700 }}>
          💬 SMS / APP NOTIFICATION
        </span>
        <span style={{ fontSize: 10, color: '#9a9ba3' }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div style={{ fontSize: 12, lineHeight: 1.5, color: '#f5f5f6' }}>
        {isDelayedOrCancelled ? (
          <div>
            <span style={{ color: '#e05252', fontWeight: 700 }}>⚠️ [ROUTELESS ALERT] </span>
            Your bus <strong style={{ color: '#f4d35e' }}>{reminder.busNumber}</strong> to{' '}
            <strong>{reminder.stopName}</strong> has encountered a schedule change!
            {disruptionNote ? (
              <div style={{ marginTop: 4, color: '#f4a435', fontStyle: 'italic' }}>
                &quot;{disruptionNote}&quot;
              </div>
            ) : (
              <div style={{ marginTop: 4, color: '#f4a435' }}>
                New Arrival Time: {formatTime(reminder.busArrivalTime)}
              </div>
            )}
            <div style={{ marginTop: 6, fontSize: 11, color: '#9a9ba3' }}>
              Check the alternatives directory if you need private transport.
            </div>
          </div>
        ) : (
          <div>
            <span style={{ color: '#4caf84', fontWeight: 700 }}>🚌 [ROUTELESS DISPATCH] </span>
            Reminder: Bus <strong style={{ color: '#f4d35e' }}>{reminder.busNumber}</strong> is scheduled
            to reach <strong>{reminder.stopName}</strong> in approx{' '}
            <strong>{reminder.minutesBefore} minutes</strong> ({formatTime(reminder.busArrivalTime)}).
            Please proceed to the boarding area.
          </div>
        )}
      </div>
    </div>
  );
}
