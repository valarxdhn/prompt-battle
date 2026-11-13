'use client';

import React, { useState } from 'react';
import type { BusSearchResult } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import CrowdBadge from '../shared/CrowdBadge';
import DataTypeTag from '../shared/DataTypeTag';
import { formatTime } from '../../utils/helpers';

interface RecommendationCardProps {
  result: BusSearchResult & { tags?: string[] };
  onSetReminder: (result: BusSearchResult, minutesBefore: number) => void;
  isUnavailable?: boolean;
}

export default function RecommendationCard({
  result,
  onSetReminder,
  isUnavailable = false,
}: RecommendationCardProps) {
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [minutesOption, setMinutesOption] = useState<number | 'custom'>(15);
  const [customMinutes, setCustomMinutes] = useState(20);
  const [reminderSet, setReminderSet] = useState(false);

  const handleSetReminder = () => {
    const mins = minutesOption === 'custom' ? Number(customMinutes) : minutesOption;
    if (mins <= 0) return;

    // Request browser notification permission if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    onSetReminder(result, mins);
    setReminderSet(true);
    setTimeout(() => {
      setShowReminderForm(false);
      setReminderSet(false);
    }, 1800);
  };

  const isFull = result.status === 'full' || result.bus.seatsAvailable === 0;

  return (
    <div
      style={{
        background: isUnavailable
          ? 'rgba(24, 25, 28, 0.6)'
          : 'var(--surface, #18191c)',
        border: `1px solid ${
          isUnavailable
            ? 'rgba(224, 82, 82, 0.25)'
            : result.tags?.includes('Best Match')
            ? 'var(--accent, #f4d35e)'
            : 'var(--border, #2a2b30)'
        }`,
        borderRadius: 'var(--radius, 10px)',
        padding: '16px 20px',
        marginBottom: 16,
        opacity: isUnavailable ? 0.75 : 1,
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {/* Top Header Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: isUnavailable ? 'var(--muted)' : 'var(--accent, #f4d35e)',
              letterSpacing: '-0.02em',
            }}
          >
            {result.bus.registrationNumber}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--muted, #9a9ba3)',
              background: 'var(--surface2, #1e1f24)',
              padding: '2px 8px',
              borderRadius: 4,
            }}
          >
            {result.route.name}
          </span>
          <StatusBadge status={result.status} />
          <DataTypeTag type={result.dataType} />
        </div>

        {/* Feature Tags */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {result.tags?.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
                background:
                  tag === 'Best Match'
                    ? 'rgba(244, 211, 94, 0.15)'
                    : 'rgba(91, 156, 246, 0.15)',
                color:
                  tag === 'Best Match'
                    ? 'var(--accent, #f4d35e)'
                    : 'var(--info, #5b9cf6)',
                border: `1px solid ${
                  tag === 'Best Match'
                    ? 'rgba(244, 211, 94, 0.3)'
                    : 'rgba(91, 156, 246, 0.3)'
                }`,
              }}
            >
              ★ {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Main Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 16,
          alignItems: 'center',
          padding: '12px 0',
          borderTop: '1px solid var(--border, #2a2b30)',
          borderBottom: '1px solid var(--border, #2a2b30)',
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Boarding At
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
            {result.boardingStop.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
            Departs: {result.departureTime}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Estimated Arrival
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
            {formatTime(result.etaAtStop)}
          </div>
          {result.bus.delayMinutes > 0 && (
            <div style={{ fontSize: 11, color: 'var(--warning)', fontWeight: 600 }}>
              Delayed +{result.bus.delayMinutes}m
            </div>
          )}
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>
            Destination Est.
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>
            {formatTime(result.arrivalAtDestination)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Crowd & Seats
          </div>
          <CrowdBadge level={result.crowdLevel} seats={result.bus.seatsAvailable} />
        </div>
      </div>

      {/* Warning Banners if Full or Delay */}
      {isFull && !isUnavailable && (
        <div
          style={{
            marginTop: 10,
            padding: '6px 10px',
            borderRadius: 6,
            background: 'rgba(224, 82, 82, 0.15)',
            border: '1px solid rgba(224, 82, 82, 0.3)',
            color: 'var(--danger)',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>⚠️</span> Bus is currently reported FULL. High probability of boarding refusal.
        </div>
      )}

      {isUnavailable && (
        <div
          style={{
            marginTop: 10,
            padding: '6px 10px',
            borderRadius: 6,
            background: 'rgba(224, 82, 82, 0.15)',
            border: '1px solid rgba(224, 82, 82, 0.3)',
            color: 'var(--danger)',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          ❌ Currently unavailable ({result.bus.note || 'Breakdown reported'}). Please choose an alternative.
        </div>
      )}

      {/* Action Bar */}
      {!isUnavailable && (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            Reported by {result.bus.lastUpdatedBy.toUpperCase()} · Live sync active
          </div>

          <button
            onClick={() => setShowReminderForm(!showReminderForm)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm, 6px)',
              background: showReminderForm ? 'var(--surface2, #1e1f24)' : 'var(--accent, #f4d35e)',
              color: showReminderForm ? 'var(--text)' : '#171717',
              border: 'none',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🔔 {showReminderForm ? 'Cancel Reminder' : 'Remind Me'}
          </button>
        </div>
      )}

      {/* Expandable Advance Reminder Setup */}
      {showReminderForm && (
        <div
          style={{
            marginTop: 14,
            padding: 14,
            borderRadius: 8,
            background: 'var(--surface2, #1e1f24)',
            border: '1px solid var(--border, #2a2b30)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>
            ⏰ Set Advance Departure Reminder
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: 12, color: 'var(--muted)' }}>
            We will alert you via browser notification & in-app alerts before this bus reaches{' '}
            <strong style={{ color: 'var(--text)' }}>{result.boardingStop.name}</strong>.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[5, 10, 15, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setMinutesOption(mins)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor:
                    minutesOption === mins ? 'var(--accent)' : 'var(--border)',
                  background:
                    minutesOption === mins ? 'rgba(244, 211, 94, 0.2)' : 'transparent',
                  color: minutesOption === mins ? 'var(--accent)' : 'var(--text)',
                }}
              >
                {mins} mins before
              </button>
            ))}

            <button
              onClick={() => setMinutesOption('custom')}
              style={{
                padding: '5px 12px',
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: '1px solid',
                borderColor:
                  minutesOption === 'custom' ? 'var(--accent)' : 'var(--border)',
                background:
                  minutesOption === 'custom' ? 'rgba(244, 211, 94, 0.2)' : 'transparent',
                color: minutesOption === 'custom' ? 'var(--accent)' : 'var(--text)',
              }}
            >
              Custom
            </button>

            {minutesOption === 'custom' && (
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                style={{
                  width: 70,
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  fontSize: 12,
                }}
              />
            )}

            <button
              onClick={handleSetReminder}
              disabled={reminderSet}
              style={{
                padding: '6px 16px',
                borderRadius: 4,
                background: reminderSet ? 'var(--success)' : 'var(--accent)',
                color: '#171717',
                border: 'none',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              {reminderSet ? '✓ Reminder Active!' : 'Confirm Alert'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
