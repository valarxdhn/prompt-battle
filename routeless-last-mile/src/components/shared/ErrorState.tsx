'use client';

import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      style={{
        padding: '24px',
        background: 'rgba(224, 82, 82, 0.08)',
        border: '1px solid rgba(224, 82, 82, 0.3)',
        borderRadius: 'var(--radius, 10px)',
        margin: '16px 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
      <h4
        style={{
          margin: '0 0 6px 0',
          fontSize: 16,
          fontWeight: 700,
          color: 'var(--danger, #e05252)',
        }}
      >
        {title}
      </h4>
      <p
        style={{
          margin: '0 0 16px 0',
          fontSize: 13,
          color: 'var(--muted, #9a9ba3)',
          maxWidth: 400,
        }}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm, 6px)',
            background: 'var(--surface2, #1e1f24)',
            border: '1px solid var(--border, #2a2b30)',
            color: 'var(--text, #f5f5f6)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
