'use client';

import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  subtext?: string;
}

interface StatCardsProps {
  stats: StatItem[];
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 14,
        marginBottom: 24,
      }}
    >
      {stats.map((stat, idx) => (
        <div
          key={idx}
          style={{
            background: 'var(--surface, #18191c)',
            border: '1px solid var(--border, #2a2b30)',
            borderRadius: 'var(--radius, 10px)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
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
                fontWeight: 700,
                color: 'var(--muted, #9a9ba3)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {stat.label}
            </span>
            <span style={{ fontSize: 20 }}>{stat.icon}</span>
          </div>

          <div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: stat.color || 'var(--text, #f5f5f6)',
                lineHeight: 1.1,
              }}
            >
              {stat.value}
            </div>
            {stat.subtext && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted, #9a9ba3)',
                  marginTop: 4,
                }}
              >
                {stat.subtext}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
