'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon = '📭',
  title,
  message,
  action,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        background: 'var(--surface, #18191c)',
        border: '1px dashed var(--border, #2a2b30)',
        borderRadius: 'var(--radius, 10px)',
        margin: '16px 0',
      }}
    >
      <div style={{ fontSize: 42, marginBottom: 12 }}>{icon}</div>
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: 18,
          fontWeight: 600,
          color: 'var(--text, #f5f5f6)',
        }}
      >
        {title}
      </h3>
      {message && (
        <p
          style={{
            margin: '0 0 16px 0',
            fontSize: 14,
            color: 'var(--muted, #9a9ba3)',
            maxWidth: 420,
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
          style={{
            padding: '8px 18px',
            borderRadius: 'var(--radius-sm, 6px)',
            background: 'var(--accent, #f4d35e)',
            color: '#171717',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
